"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Edit2, Star, Camera, Search } from "lucide-react";
import AddressSearch from "@/components/payment/AddressSearch";
import { calcTemperature, getTemperatureGrade } from "@/lib/utils";
import { TEMPERATURE_GRADES } from "@/lib/constants";

interface UserProfile {
  nickname: string;
  joinDate: string;
  rating: number;
  reviews: number;
  phoneNumber: string;
  profileImageUrl?: string;
  address?: string;
  detailAddress?: string;
  zipCode?: string;
  temperature: number;
}

interface ProfileStats {
  totalBids: number;
  selling: number;
  completed: number;
  wishlisted: number;
}

interface ProfileSectionProps {
  user: UserProfile;
  isLoading: boolean;
  onSave: (
    nickname: string,
    phoneNumber: string,
    profileImageFile?: File | null,
    address?: string,
    detailAddress?: string,
    zipCode?: string,
  ) => Promise<void>;
  onUpdateNickname?: (nickname: string) => void;
  stats?: ProfileStats;
}

function Avatar({ src, nickname, size = 56, level }: { src?: string; nickname: string; size?: number; level?: number }) {
  if (src) {
    return (
      <Image
        src={src}
        alt={nickname}
        width={size}
        height={size}
        className="rounded-full object-cover"
        style={{ width: size, height: size }}
        unoptimized
      />
    );
  }
  if (level) {
    return (
      <Image
        src={`/Lv${level}.png`}
        alt={`Lv${level} 캐릭터`}
        width={size}
        height={size}
        className="rounded-full object-cover bg-primary/10"
        style={{ width: size, height: size }}
      />
    );
  }
  const initials = nickname.slice(0, 2);
  return (
    <div
      className="flex items-center justify-center rounded-full bg-primary/15 font-bold text-primary"
      style={{ width: size, height: size, fontSize: size * 0.3 }}
    >
      {initials}
    </div>
  );
}

function TemperatureBadge({ rating, reviews }: { rating: number; reviews: number }) {
  const temp = calcTemperature(rating, reviews);
  const grade = getTemperatureGrade(temp);
  return (
    <div className="flex items-center gap-2">
      <span className={`text-sm font-bold ${grade.color}`}>
        {grade.emoji} {temp}°C
      </span>
      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${grade.color} bg-white/8`}>
        {grade.label}
      </span>
    </div>
  );
}

export default function ProfileSection({
  user,
  isLoading,
  onSave,
  onUpdateNickname,
  stats,
}: ProfileSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nicknameInput, setNicknameInput] = useState(user.nickname);
  const [phoneNumberInput, setPhoneNumberInput] = useState(user.phoneNumber);
  const [addressInput, setAddressInput] = useState(user.address ?? "");
  const [detailAddressInput, setDetailAddressInput] = useState(user.detailAddress ?? "");
  const [zipCodeInput, setZipCodeInput] = useState(user.zipCode ?? "");
  const [showAddressSearch, setShowAddressSearch] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isModalOpen) {
      setNicknameInput(user.nickname);
      setPhoneNumberInput(user.phoneNumber);
      setAddressInput(user.address ?? "");
      setDetailAddressInput(user.detailAddress ?? "");
      setZipCodeInput(user.zipCode ?? "");
      setSelectedFile(null);
      setPreviewUrl(null);
    }
  }, [isModalOpen, user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.warning("이미지 파일만 업로드할 수 있습니다."); return; }
    if (file.size > 5 * 1024 * 1024) { toast.warning("5MB 이하의 이미지만 업로드할 수 있습니다."); return; }
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setPreviewUrl(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    const trimmedNick = nicknameInput.trim();
    const trimmedPhone = phoneNumberInput.trim();
    if (!trimmedNick) { toast.warning("닉네임을 입력해주세요."); return; }
    if (trimmedNick.length > 8) { toast.warning("닉네임은 8자 이하로 입력해주세요."); return; }
    if (!trimmedPhone) { toast.warning("전화번호를 입력해주세요."); return; }
    try {
      setIsSaving(true);
      await onSave(
        trimmedNick,
        trimmedPhone,
        selectedFile,
        addressInput || undefined,
        detailAddressInput || undefined,
        zipCodeInput || undefined,
      );
      onUpdateNickname?.(trimmedNick);
      setIsModalOpen(false);
      toast.success("프로필이 성공적으로 변경되었습니다.");
    } catch {
      toast.error("프로필 수정에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  const currentAvatarSrc = previewUrl ?? user.profileImageUrl;

  const userLevel =
    TEMPERATURE_GRADES.findIndex((g) => g.label === getTemperatureGrade(calcTemperature(user.rating, user.reviews)).label) + 1;

  const statItems = stats
    ? [
        { label: "총 입찰", value: stats.totalBids },
        { label: "판매중", value: stats.selling },
        { label: "낙찰완료", value: stats.completed },
        { label: "찜한 상품", value: stats.wishlisted },
      ]
    : null;

  return (
    <div className="mb-8 rounded-2xl border border-white/8 bg-card p-6 shadow-lg shadow-black/10 md:p-8">
      <div className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 flex-1 items-center gap-4">
          {/* 아바타 */}
          {isLoading ? (
            <Skeleton className="h-14 w-14 shrink-0 rounded-full" />
          ) : (
            <div className="shrink-0">
              <Avatar src={user.profileImageUrl} nickname={user.nickname} size={56} level={userLevel} />
            </div>
          )}

          {/* 닉네임/온도/가입일/별점 */}
          <div className="min-w-0 flex-1">
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
            ) : (
              <>
                <h1 className="text-foreground text-2xl font-black md:text-3xl">
                  {user.nickname}
                </h1>
                {/* 온도 & 등급 */}
                <div className="mt-1.5">
                  <TemperatureBadge rating={user.rating} reviews={user.reviews} />
                </div>
                <p className="text-muted-foreground mt-1.5 text-sm">{user.joinDate}</p>
                {user.rating > 0 && (
                  <div className="mt-1 flex items-center gap-1.5">
                    <Star className="h-4 w-4 fill-primary text-primary" />
                    <span className="text-foreground text-sm font-semibold">{user.rating}</span>
                    <span className="text-muted-foreground text-xs">({user.reviews}개 리뷰)</span>
                  </div>
                )}
                {user.address && (
                  <p className="text-muted-foreground mt-1 text-xs truncate">
                    📍 {user.address}
                  </p>
                )}
              </>
            )}
          </div>
        </div>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen} modal={!showAddressSearch}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-2 rounded-lg border-border/60 text-muted-foreground hover:border-primary/40 hover:text-foreground sm:w-auto"
            >
              <Edit2 className="h-4 w-4" /> 프로필 수정
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[440px]">
            <DialogHeader>
              <DialogTitle>프로필 수정</DialogTitle>
              <DialogDescription>새 정보를 입력해주세요.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-5 py-4">
              {/* 프로필 사진 */}
              <div className="flex flex-col items-center gap-3">
                <div className="relative">
                  <Avatar
                    src={currentAvatarSrc ?? undefined}
                    nickname={nicknameInput || user.nickname}
                    size={88}
                    level={userLevel}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full border-2 border-card bg-primary text-primary-foreground shadow-md transition-opacity hover:opacity-80"
                    aria-label="프로필 사진 변경"
                  >
                    <Camera className="h-3.5 w-3.5" />
                  </button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-muted-foreground hover:text-foreground text-xs underline-offset-2 hover:underline"
                >
                  사진 변경
                </button>
              </div>

              {/* 닉네임 */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="nickname" className="text-right">닉네임</Label>
                <Input
                  id="nickname"
                  value={nicknameInput}
                  maxLength={8}
                  onChange={(e) => setNicknameInput(e.target.value)}
                  className="col-span-3"
                  placeholder="새 닉네임"
                />
              </div>

              {/* 전화번호 */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phoneNumber" className="text-right">전화번호</Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  value={phoneNumberInput}
                  onChange={(e) => setPhoneNumberInput(e.target.value)}
                  className="col-span-3"
                  placeholder="010-0000-0000"
                />
              </div>

              {/* 주소 */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">기본 배송지</Label>
                <div className="flex gap-2">
                  <Input
                    value={zipCodeInput}
                    readOnly
                    placeholder="우편번호"
                    className="w-28 shrink-0 cursor-default bg-muted/40"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-1.5 shrink-0"
                    onClick={() => setShowAddressSearch(true)}
                  >
                    <Search className="h-3.5 w-3.5" />
                    주소 검색
                  </Button>
                </div>
                <Input
                  value={addressInput}
                  readOnly
                  placeholder="주소"
                  className="cursor-default bg-muted/40"
                />
                <Input
                  value={detailAddressInput}
                  onChange={(e) => setDetailAddressInput(e.target.value)}
                  placeholder="상세주소 입력"
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? "저장 중..." : "변경하기"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* 활동 통계 카드 */}
      {statItems && !isLoading && (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {statItems.map(({ label, value }) => (
            <div
              key={label}
              className="rounded-xl border border-white/8 bg-card/50 p-3 text-center"
            >
              <p className="font-price text-foreground text-2xl font-black">{value}</p>
              <p className="text-muted-foreground mt-0.5 text-xs">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Daum 주소 검색 팝업 */}
      {showAddressSearch && (
        <AddressSearch
          onComplete={({ zonecode, address }) => {
            setZipCodeInput(zonecode);
            setAddressInput(address);
            setDetailAddressInput("");
            setShowAddressSearch(false);
          }}
          onClose={() => setShowAddressSearch(false)}
        />
      )}
    </div>
  );
}
