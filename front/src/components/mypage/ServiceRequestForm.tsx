"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, type FormEvent } from "react";
import Checkbox from "@/components/common/Checkbox";
import DatePicker from "@/components/common/DatePicker";
import Modal from "@/components/common/Modal";
import Select from "@/components/common/Select";
import { API_BASE_URL } from "@/lib/api";
import { CATEGORIES, type ServiceCategoryCode } from "@/lib/categories";
import { ONLINE_REGION, REGIONS, type RegionId } from "@/lib/regions";
import {
  ATTACHMENT_ACCEPT,
  ATTACHMENT_MAX_BYTES,
  MAX_ATTACHMENTS,
  manwonToWon,
  submitServiceRequest,
  uploadServiceRequestImage,
  type UploadedAttachment,
} from "@/lib/service-requests";

/**
 * 서비스 요청 등록 폼 — 마이페이지 셸 안(로그인은 셸이 보장).
 * 카테고리가 파생 UI를 정한다: 현장형(청소·인테리어·페인트)은 상세 주소를 받고 "온라인" 지역을 숨기며,
 * 작업 규모 단위(평/페이지)도 카테고리를 따른다. 협의 가능·제안 받아요를 체크하면 해당 입력을 잠근다.
 * 사진은 고르는 즉시 임시 업로드해 미리보기하고, 제출 시 tempFileId만 보낸다(서버가 승격).
 * 숫자 입력은 문자열 state로 들고 제출 때 검증한다(관리자 FaqForm과 같은 방식). 예산은 만원 단위 입력 → 원으로 변환.
 * 스타일: styles/pages/mypage.css(request-form)
 */
export default function ServiceRequestForm() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [categoryCode, setCategoryCode] = useState<ServiceCategoryCode>(CATEGORIES[0].code);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [region, setRegion] = useState<RegionId | "">("");
  const [addressDetail, setAddressDetail] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [scheduleNegotiable, setScheduleNegotiable] = useState(false);
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [budgetNegotiable, setBudgetNegotiable] = useState(false);
  const [unitValue, setUnitValue] = useState("");
  const [attachments, setAttachments] = useState<UploadedAttachment[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [createdId, setCreatedId] = useState<number | null>(null);

  const category = CATEGORIES.find((c) => c.code === categoryCode)!;
  const regionOptions = category.requiresSite
    ? REGIONS.filter((r) => r.id !== ONLINE_REGION)
    : REGIONS;
  const today = new Date().toISOString().slice(0, 10);
  const busy = submitting || uploading;

  const handleCategoryChange = (code: ServiceCategoryCode) => {
    setCategoryCode(code);
    const next = CATEGORIES.find((c) => c.code === code)!;
    // 현장형으로 바꿨는데 온라인이 선택돼 있으면 초기화, 비현장형이면 상세 주소를 비운다
    if (next.requiresSite && region === ONLINE_REGION) setRegion("");
    if (!next.requiresSite) setAddressDetail("");
  };

  const handleFilesChange = async (files: FileList | null) => {
    if (!files || files.length === 0 || uploading) return;
    setUploadError(null);
    const remaining = MAX_ATTACHMENTS - attachments.length;
    const selected = Array.from(files);
    if (selected.length > remaining) {
      setUploadError(`참고 사진은 최대 ${MAX_ATTACHMENTS}장까지 첨부할 수 있어요.`);
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
        const uploaded = await uploadServiceRequestImage(file);
        setAttachments((prev) => [...prev, uploaded]);
      }
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : "사진 업로드에 실패했습니다.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeAttachment = (tempFileId: number) => {
    setAttachments((prev) => prev.filter((a) => a.tempFileId !== tempFileId));
  };

  const parsePositiveInt = (value: string): number | null => {
    if (value.trim() === "") return null;
    const n = Number(value);
    return Number.isInteger(n) && n > 0 ? n : NaN;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (busy) return;

    if (!title.trim() || !content.trim()) {
      setSubmitError("제목과 요청 내용을 입력해주세요.");
      return;
    }
    if (!region) {
      setSubmitError("지역을 선택해주세요.");
      return;
    }
    if (!scheduleNegotiable && !preferredDate) {
      setSubmitError("희망 일정을 선택하거나 '협의 가능'을 체크해주세요.");
      return;
    }
    let budgetMinWon: number | null = null;
    let budgetMaxWon: number | null = null;
    if (!budgetNegotiable) {
      const min = parsePositiveInt(budgetMin);
      const max = parsePositiveInt(budgetMax);
      if (min === null || max === null || Number.isNaN(min) || Number.isNaN(max)) {
        setSubmitError("희망 예산은 최소·최대를 만원 단위 숫자로 입력하거나 '제안 받아요'를 체크해주세요.");
        return;
      }
      if (min > max) {
        setSubmitError("희망 예산의 최소 금액은 최대 금액 이하여야 해요.");
        return;
      }
      budgetMinWon = manwonToWon(min);
      budgetMaxWon = manwonToWon(max);
    }
    const unit = parsePositiveInt(unitValue);
    if (unit !== null && Number.isNaN(unit)) {
      setSubmitError(`작업 규모는 1 이상의 숫자(${category.unitLabel})로 입력해주세요.`);
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    try {
      const created = await submitServiceRequest({
        category: categoryCode,
        title: title.trim(),
        content: content.trim(),
        region,
        addressDetail: category.requiresSite && addressDetail.trim() ? addressDetail.trim() : null,
        preferredDate: scheduleNegotiable ? null : preferredDate,
        scheduleNegotiable,
        budgetMin: budgetMinWon,
        budgetMax: budgetMaxWon,
        budgetNegotiable,
        unitValue: unit,
        attachmentTempFileIds: attachments.map((a) => a.tempFileId),
      });
      setCreatedId(created.id);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "요청 등록에 실패했습니다.");
      setSubmitting(false);
    }
  };

  const goToDetail = () => {
    if (createdId !== null) router.push(`/mypage/requests/${createdId}`);
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="request-form" noValidate>
        <div className="request-form__row">
          <div className="request-form__field">
            <label htmlFor="request-category" className="request-form__label">
              카테고리
            </label>
            <Select
              id="request-category"
              value={categoryCode}
              onChange={(v) => handleCategoryChange(v as ServiceCategoryCode)}
              options={CATEGORIES.map((c) => ({ value: c.code, label: c.label }))}
              disabled={busy}
            />
          </div>
          <div className="request-form__field">
            <label htmlFor="request-region" className="request-form__label">
              지역
            </label>
            <Select
              id="request-region"
              value={region}
              onChange={(v) => setRegion(v as RegionId | "")}
              placeholder="지역을 선택하세요"
              options={regionOptions.map((r) => ({
                value: r.id,
                label: r.id === ONLINE_REGION ? r.label : `서울 ${r.label}`,
              }))}
              disabled={busy}
            />
            <span className="request-form__hint">
              {category.requiresSite
                ? "현재는 서울 지역만 지원해요. 구 단위까지만 공개되고, 상세 주소는 매칭된 업체에게만 보여요."
                : "비대면 작업이면 '온라인·지역 무관'을 선택하세요."}
            </span>
          </div>
        </div>

        {category.requiresSite && (
          <div className="request-form__field">
            <label htmlFor="request-address" className="request-form__label">
              상세 주소 <span className="request-form__optional">(선택)</span>
            </label>
            <input
              id="request-address"
              type="text"
              value={addressDetail}
              onChange={(e) => setAddressDetail(e.target.value)}
              maxLength={200}
              placeholder="예: 봉천동 ○○아파트 101동 202호"
              disabled={busy}
              className="request-form__input"
            />
          </div>
        )}

        <div className="request-form__field">
          <label htmlFor="request-title" className="request-form__label">
            제목
          </label>
          <input
            id="request-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={100}
            placeholder="예: 이사 나가기 전 원상복구 청소 필요해요"
            disabled={busy}
            className="request-form__input"
          />
        </div>

        <div className="request-form__field">
          <label htmlFor="request-content" className="request-form__label">
            요청 내용
          </label>
          <textarea
            id="request-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={5000}
            placeholder="작업 범위·현재 상태·원하는 결과를 자세히 적어주시면 정확한 제안을 받을 수 있어요. (5,000자 이내)"
            disabled={busy}
            className="request-form__textarea"
          />
          <span className="request-form__hint">
            연락처·계좌번호 등 개인정보는 적지 말아주세요. 연락은 플랫폼 안에서 이뤄져요.
          </span>
        </div>

        <div className="request-form__row">
          <div className="request-form__field">
            <label htmlFor="request-date" className="request-form__label">
              희망 일정
            </label>
            <DatePicker
              id="request-date"
              value={preferredDate}
              min={today}
              onChange={setPreferredDate}
              disabled={busy || scheduleNegotiable}
              placeholder="날짜를 선택하세요"
            />
            <Checkbox checked={scheduleNegotiable} onChange={setScheduleNegotiable} disabled={busy}>
              협의 가능
            </Checkbox>
          </div>

          <div className="request-form__field">
            <label htmlFor="request-unit" className="request-form__label">
              작업 규모 <span className="request-form__optional">(선택)</span>
            </label>
            <div className="request-form__unit">
              <input
                id="request-unit"
                type="number"
                inputMode="numeric"
                min={1}
                step={1}
                value={unitValue}
                onChange={(e) => setUnitValue(e.target.value)}
                placeholder={category.unitLabel === "평" ? "예: 24" : "예: 5"}
                disabled={busy}
                className="request-form__input"
              />
              <span className="request-form__unit-label">{category.unitLabel}</span>
            </div>
          </div>
        </div>

        <fieldset className="request-form__field request-form__fieldset">
          <legend className="request-form__label">희망 예산</legend>
          <div className="request-form__budget">
            <div className="request-form__unit">
              <input
                id="request-budget-min"
                type="number"
                inputMode="numeric"
                min={1}
                step={1}
                value={budgetMin}
                onChange={(e) => setBudgetMin(e.target.value)}
                placeholder="최소"
                aria-label="희망 예산 최소(만원)"
                disabled={busy || budgetNegotiable}
                className="request-form__input"
              />
              <span className="request-form__unit-label">만원</span>
            </div>
            <span className="request-form__budget-sep" aria-hidden="true">
              ~
            </span>
            <div className="request-form__unit">
              <input
                id="request-budget-max"
                type="number"
                inputMode="numeric"
                min={1}
                step={1}
                value={budgetMax}
                onChange={(e) => setBudgetMax(e.target.value)}
                placeholder="최대"
                aria-label="희망 예산 최대(만원)"
                disabled={busy || budgetNegotiable}
                className="request-form__input"
              />
              <span className="request-form__unit-label">만원</span>
            </div>
          </div>
          <Checkbox checked={budgetNegotiable} onChange={setBudgetNegotiable} disabled={busy}>
            제안 받아요 (예산 미정)
          </Checkbox>
        </fieldset>

        <div className="request-form__field">
          <span className="request-form__label">
            참고 사진 <span className="request-form__optional">(선택, 최대 {MAX_ATTACHMENTS}장)</span>
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
            {attachments.map((attachment, index) => (
              <li key={attachment.tempFileId} className="request-form__attachment">
                {/* 백엔드 정적 서빙 이미지라 next/image 최적화 대상이 아님 */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`${API_BASE_URL}${attachment.previewUrl}`}
                  alt={`참고 사진 ${index + 1}`}
                  className="request-form__attachment-image"
                />
                <button
                  type="button"
                  onClick={() => removeAttachment(attachment.tempFileId)}
                  disabled={busy}
                  className="request-form__attachment-remove"
                  aria-label={`참고 사진 ${index + 1} 삭제`}
                >
                  ×
                </button>
              </li>
            ))}
            {attachments.length < MAX_ATTACHMENTS && (
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
          <span className="request-form__hint">jpg·png·webp, 한 장 5MB 이하</span>
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
            {submitting ? "등록 중…" : "요청 등록"}
          </button>
          <Link href="/mypage/requests" className="btn btn--outline request-form__btn">
            취소
          </Link>
        </div>
      </form>

      <Modal
        open={createdId !== null}
        title="요청을 등록했어요"
        onClose={goToDetail}
        closeOnBackdrop={false}
        actions={
          <button type="button" className="btn btn--primary modal__btn" onClick={goToDetail}>
            요청 보기
          </button>
        }
      >
        <p>업체들의 제안을 기다려 주세요. 등록한 요청은 마이페이지 &gt; 요청한 서비스에서 확인할 수 있어요.</p>
      </Modal>
    </>
  );
}
