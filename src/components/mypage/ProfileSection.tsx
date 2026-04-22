"use client";

import { useState, useEffect } from "react";
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
import { Edit2 } from "lucide-react";

interface UserProfile {
  nickname: string;
  joinDate: string;
  rating: number;
  reviews: number;
  phoneNumber: string;
}

interface ProfileSectionProps {
  user: UserProfile;
  isLoading: boolean;
  onSave: (nickname: string, phoneNumber: string) => Promise<void>;
  onUpdateNickname?: (nickname: string) => void;
}

export default function ProfileSection({
  user,
  isLoading,
  onSave,
  onUpdateNickname,
}: ProfileSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nicknameInput, setNicknameInput] = useState(user.nickname);
  const [phoneNumberInput, setPhoneNumberInput] = useState(user.phoneNumber);
  const [isSaving, setIsSaving] = useState(false);

  // 모달이 열릴 때마다 user prop의 최신 값으로 입력 필드 동기화
  useEffect(() => {
    if (isModalOpen) {
      setNicknameInput(user.nickname);
      setPhoneNumberInput(user.phoneNumber);
    }
  }, [isModalOpen, user]);

  const handleSave = async () => {
    const trimmedNick = nicknameInput.trim();
    const trimmedPhone = phoneNumberInput.trim();

    if (!trimmedNick) return alert("닉네임을 입력해주세요.");
    if (trimmedNick.length > 8)
      return alert("닉네임은 8자 이하로 입력해주세요.");
    if (!trimmedPhone) return alert("전화번호를 입력해주세요.");

    try {
      setIsSaving(true);
      await onSave(trimmedNick, trimmedPhone);
      onUpdateNickname?.(trimmedNick);
      setIsModalOpen(false);
      alert("프로필이 성공적으로 변경되었습니다.");
    } catch {
      alert("프로필 수정에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="border-border bg-card mb-8 rounded-lg border p-6 md:p-8">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          ) : (
            <>
              <h1 className="text-foreground text-2xl font-bold md:text-3xl">
                {user.nickname}
              </h1>
              <p className="text-muted-foreground mt-2 text-sm">
                {user.joinDate}
              </p>
            </>
          )}
        </div>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 rounded-lg bg-transparent"
            >
              <Edit2 className="h-4 w-4" /> 프로필 수정
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>프로필 수정</DialogTitle>
              <DialogDescription>새 정보를 입력해주세요.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="nickname" className="text-right">
                  닉네임
                </Label>
                <Input
                  id="nickname"
                  value={nicknameInput}
                  maxLength={8}
                  onChange={(e) => setNicknameInput(e.target.value)}
                  className="col-span-3"
                  placeholder="새 닉네임"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phoneNumber" className="text-right">
                  전화번호
                </Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  value={phoneNumberInput}
                  onChange={(e) => setPhoneNumberInput(e.target.value)}
                  className="col-span-3"
                  placeholder="010-0000-0000"
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
    </div>
  );
}
