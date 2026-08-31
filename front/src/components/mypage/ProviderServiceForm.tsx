"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import Checkbox from "@/components/common/Checkbox";
import Modal from "@/components/common/Modal";
import Select from "@/components/common/Select";
import RegionPicker from "@/components/mypage/RegionPicker";
import { API_BASE_URL } from "@/lib/api";
import { CATEGORIES, type ServiceCategoryCode } from "@/lib/categories";
import {
  MAX_IMAGES,
  createServiceListing,
  fetchMyServiceListing,
  updateServiceListing,
  uploadServiceListingImage,
} from "@/lib/provider-services";
import { ONLINE_REGION, type RegionId } from "@/lib/regions";
import { ATTACHMENT_ACCEPT, ATTACHMENT_MAX_BYTES, manwonToWon } from "@/lib/service-requests";

/** 폼의 사진 항목 — 기존 유지(fileId)·새 업로드(tempFileId) 혼합. url은 서빙 경로(/images/...) */
type ImageItem = {
  key: string;
  fileId?: number;
  tempFileId?: number;
  url: string;
};

/**
 * 업체 서비스 등록·수정 폼 — 업체 모드 셸 안(PROVIDER 가드는 biz/layout이 보장).
 * 카테고리가 파생 UI를 정한다: 현장형(청소·인테리어·페인트)은 자치구 복수 선택(RegionPicker),
 * 비현장형(웹·디자인)은 픽커를 숨기고 제출 시 ONLINE으로 고정한다. "견적 후 결정"은 시작가 입력을 잠근다.
 * 사진은 고르는 즉시 임시 업로드해 미리보기하고, 제출 시 유지(fileId)·신규(tempFileId) 참조 목록을 보낸다
 * (서버가 승격·교체). 숫자 입력은 문자열 state로 들고 제출 때 검증, 시작가는 만원 입력 → 원 변환.
 * 스타일: styles/pages/mypage.css(request-form 재사용 + region-picker)
 */
export default function ProviderServiceForm({
  mode,
  id,
}: {
  mode: "create" | "edit";
  id?: number;
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [categoryCode, setCategoryCode] = useState<ServiceCategoryCode>(CATEGORIES[0].code);
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [description, setDescription] = useState("");
  const [regions, setRegions] = useState<RegionId[]>([]);
  const [priceFrom, setPriceFrom] = useState("");
  const [priceNegotiable, setPriceNegotiable] = useState(false);
  const [duration, setDuration] = useState("");
  const [unitValue, setUnitValue] = useState("");
  const [images, setImages] = useState<ImageItem[]>([]);
  const [loading, setLoading] = useState(mode === "edit");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const category = CATEGORIES.find((c) => c.code === categoryCode)!;
  const busy = submitting || uploading || loading;

  // 수정 모드 — 기존 서비스로 프리필(시작가는 원 → 만원, 사진은 fileId 참조로 유지)
  useEffect(() => {
    if (mode !== "edit" || id === undefined) return;
    let cancelled = false;
    fetchMyServiceListing(id)
      .then((detail) => {
        if (cancelled) return;
        setCategoryCode(detail.category);
        setTitle(detail.title);
        setSummary(detail.summary);
        setDescription(detail.description);
        setRegions(detail.regions.filter((r) => r !== ONLINE_REGION));
        setPriceFrom(detail.priceFrom !== null ? String(detail.priceFrom / 10_000) : "");
        setPriceNegotiable(detail.priceNegotiable);
        setDuration(detail.duration ?? "");
        setUnitValue(detail.unitValue !== null ? String(detail.unitValue) : "");
        setImages(
          detail.images.map((image) => ({
            key: `file-${image.fileId}`,
            fileId: image.fileId,
            url: image.url,
          })),
        );
        setLoading(false);
      })
      .catch((e: Error) => {
        if (!cancelled) setLoadError(e.message);
      });
    return () => {
      cancelled = true;
    };
  }, [mode, id]);

  const handleFilesChange = async (files: FileList | null) => {
    if (!files || files.length === 0 || uploading) return;
    setUploadError(null);
    const remaining = MAX_IMAGES - images.length;
    const selected = Array.from(files);
    if (selected.length > remaining) {
      setUploadError(`서비스 사진은 최대 ${MAX_IMAGES}장까지 등록할 수 있어요.`);
      if (remaining <= 0) return;
    }
    const batch = selected.slice(0, Math.max(remaining, 0));
    const oversized = batch.find((f) => f.size > ATTACHMENT_MAX_BYTES);
    if (oversized) {
      setUploadError("사진 한 장의 크기는 5MB 이하여야 해요.");
      return;
    }
    setUploading(true);
    try {
      for (const file of batch) {
        const uploaded = await uploadServiceListingImage(file);
        setImages((prev) => [
          ...prev,
          {
            key: `temp-${uploaded.tempFileId}`,
            tempFileId: uploaded.tempFileId,
            url: uploaded.previewUrl,
          },
        ]);
      }
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : "사진 업로드에 실패했습니다.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeImage = (key: string) => {
    setImages((prev) => prev.filter((image) => image.key !== key));
  };

  const parsePositiveInt = (value: string): number | null => {
    if (value.trim() === "") return null;
    const n = Number(value);
    return Number.isInteger(n) && n > 0 ? n : NaN;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (busy) return;

    if (!title.trim() || !summary.trim() || !description.trim()) {
      setSubmitError("서비스명·한 줄 소개·상세 설명을 입력해주세요.");
      return;
    }
    if (category.requiresSite && regions.length === 0) {
      setSubmitError("서비스 지역을 1개 이상 선택해주세요.");
      return;
    }
    let priceFromWon: number | null = null;
    if (!priceNegotiable) {
      const price = parsePositiveInt(priceFrom);
      if (price === null || Number.isNaN(price)) {
        setSubmitError("시작가를 만원 단위 숫자로 입력하거나 '견적 후 결정'을 체크해주세요.");
        return;
      }
      priceFromWon = manwonToWon(price);
    }
    const unit = parsePositiveInt(unitValue);
    if (unit !== null && Number.isNaN(unit)) {
      setSubmitError(`가격 기준 규모는 1 이상의 숫자(${category.unitLabel})로 입력해주세요.`);
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    try {
      const input = {
        category: categoryCode,
        title: title.trim(),
        summary: summary.trim(),
        description: description.trim(),
        // 비현장형은 지역 무관 — 서버 계약대로 ONLINE 하나로 고정
        regions: category.requiresSite ? regions : [ONLINE_REGION],
        priceFrom: priceFromWon,
        priceNegotiable,
        duration: duration.trim() ? duration.trim() : null,
        unitValue: unit,
        images: images.map((image) =>
          image.fileId !== undefined
            ? { fileId: image.fileId }
            : { tempFileId: image.tempFileId },
        ),
      };
      if (mode === "edit" && id !== undefined) {
        await updateServiceListing(id, input);
      } else {
        await createServiceListing(input);
      }
      setSaved(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "서비스 저장에 실패했습니다.");
      setSubmitting(false);
    }
  };

  const goToList = () => {
    router.push("/mypage/biz/services");
  };

  if (loadError) {
    return (
      <p className="request-form__error" role="alert">
        {loadError}
      </p>
    );
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="request-form" noValidate>
        <div className="request-form__row">
          <div className="request-form__field">
            <label htmlFor="service-category" className="request-form__label">
              카테고리
            </label>
            <Select
              id="service-category"
              value={categoryCode}
              onChange={(v) => setCategoryCode(v as ServiceCategoryCode)}
              options={CATEGORIES.map((c) => ({ value: c.code, label: c.label }))}
              disabled={busy}
            />
            {!category.requiresSite && (
              <span className="request-form__hint">
                비대면 서비스라 &lsquo;온라인·지역 무관&rsquo;으로 등록돼요.
              </span>
            )}
          </div>
          <div className="request-form__field">
            <label htmlFor="service-duration" className="request-form__label">
              작업 소요 기간 <span className="request-form__optional">(선택)</span>
            </label>
            <input
              id="service-duration"
              type="text"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              maxLength={30}
              placeholder={category.requiresSite ? "예: 3~4시간" : "예: 4~6주"}
              disabled={busy}
              className="request-form__input"
            />
          </div>
        </div>

        {category.requiresSite && (
          <div className="request-form__field">
            <span className="request-form__label">서비스 지역</span>
            <RegionPicker value={regions} onChange={setRegions} disabled={busy} />
            <span className="request-form__hint">
              현재는 서울 지역만 지원해요. 작업하러 갈 수 있는 자치구를 모두 선택하세요.
            </span>
          </div>
        )}

        <div className="request-form__field">
          <label htmlFor="service-title" className="request-form__label">
            서비스명
          </label>
          <input
            id="service-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={100}
            placeholder="예: 원룸·오피스텔 입주청소 전문"
            disabled={busy}
            className="request-form__input"
          />
        </div>

        <div className="request-form__field">
          <label htmlFor="service-summary" className="request-form__label">
            한 줄 소개
          </label>
          <input
            id="service-summary"
            type="text"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            maxLength={150}
            placeholder="목록 카드에 보이는 소개예요. 강점을 한 문장으로 담아보세요."
            disabled={busy}
            className="request-form__input"
          />
        </div>

        <div className="request-form__field">
          <label htmlFor="service-description" className="request-form__label">
            상세 설명
          </label>
          <textarea
            id="service-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={5000}
            placeholder="작업 범위·포함 항목·진행 방식을 자세히 적어주시면 예약 문의가 늘어나요. (5,000자 이내)"
            disabled={busy}
            className="request-form__textarea"
          />
          <span className="request-form__hint">
            연락처·계좌번호 등 개인정보는 적지 말아주세요. 연락은 플랫폼 안에서 이뤄져요.
          </span>
        </div>

        <div className="request-form__row">
          <fieldset className="request-form__field request-form__fieldset">
            <legend className="request-form__label">시작가</legend>
            <div className="request-form__unit">
              <input
                id="service-price"
                type="number"
                inputMode="numeric"
                min={1}
                step={1}
                value={priceFrom}
                onChange={(e) => setPriceFrom(e.target.value)}
                placeholder="예: 15"
                aria-label="시작가(만원)"
                disabled={busy || priceNegotiable}
                className="request-form__input"
              />
              <span className="request-form__unit-label">만원~</span>
            </div>
            <Checkbox checked={priceNegotiable} onChange={setPriceNegotiable} disabled={busy}>
              견적 후 결정
            </Checkbox>
          </fieldset>

          <div className="request-form__field">
            <label htmlFor="service-unit" className="request-form__label">
              가격 기준 규모 <span className="request-form__optional">(선택)</span>
            </label>
            <div className="request-form__unit">
              <input
                id="service-unit"
                type="number"
                inputMode="numeric"
                min={1}
                step={1}
                value={unitValue}
                onChange={(e) => setUnitValue(e.target.value)}
                placeholder={category.unitLabel === "평" ? "예: 10" : "예: 5"}
                disabled={busy}
                className="request-form__input"
              />
              <span className="request-form__unit-label">{category.unitLabel} 기준</span>
            </div>
          </div>
        </div>

        <div className="request-form__field">
          <span className="request-form__label">
            서비스 사진 <span className="request-form__optional">(선택, 최대 {MAX_IMAGES}장)</span>
          </span>
          <input
            ref={fileInputRef}
            type="file"
            accept={ATTACHMENT_ACCEPT}
            multiple
            className="sr-only"
            onChange={(e) => void handleFilesChange(e.target.files)}
            disabled={busy}
          />
          <ul className="request-form__attachments">
            {images.map((image, index) => (
              <li key={image.key} className="request-form__attachment">
                {/* 백엔드 정적 서빙 이미지라 next/image 최적화 대상이 아님 */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`${API_BASE_URL}${image.url}`}
                  alt={`서비스 사진 ${index + 1}`}
                  className="request-form__attachment-image"
                />
                {index === 0 && <span className="request-form__attachment-badge">대표</span>}
                <button
                  type="button"
                  onClick={() => removeImage(image.key)}
                  disabled={busy}
                  className="request-form__attachment-remove"
                  aria-label={`서비스 사진 ${index + 1} 삭제`}
                >
                  ×
                </button>
              </li>
            ))}
            {images.length < MAX_IMAGES && (
              <li className="request-form__attachment">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={busy}
                  className="request-form__attachment-add"
                >
                  {uploading ? "업로드 중…" : "+ 사진 추가"}
                </button>
              </li>
            )}
          </ul>
          <span className="request-form__hint">jpg·png·webp, 한 장 5MB 이하. 첫 장이 대표 사진이에요.</span>
          {uploadError && (
            <p className="request-form__error" role="alert">
              {uploadError}
            </p>
          )}
        </div>

        {submitError && (
          <p className="request-form__error" role="alert">
            {submitError}
          </p>
        )}

        <div className="request-form__actions">
          <button type="submit" className="btn btn--primary request-form__btn" disabled={busy}>
            {submitting ? "저장 중…" : mode === "edit" ? "수정 저장" : "서비스 등록"}
          </button>
          <Link href="/mypage/biz/services" className="btn btn--outline request-form__btn">
            취소
          </Link>
        </div>
      </form>

      <Modal
        open={saved}
        title={mode === "edit" ? "서비스를 수정했어요" : "서비스를 등록했어요"}
        onClose={goToList}
        closeOnBackdrop={false}
        actions={
          <button type="button" className="btn btn--primary modal__btn" onClick={goToList}>
            목록으로
          </button>
        }
      >
        <p>
          {mode === "edit"
            ? "변경한 내용이 해드려요에 바로 반영돼요."
            : "등록한 서비스는 해드려요에 공개되고, 내 서비스에서 언제든 수정하거나 숨길 수 있어요."}
        </p>
      </Modal>
    </>
  );
}
