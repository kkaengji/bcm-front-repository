"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useReview } from "@/hooks/useReview";

interface ReviewModalProps {
  productId: number;
  productName: string;
  reviewType: "BUYER_TO_SELLER" | "SELLER_TO_BUYER";
  onClose: () => void;
  onSuccess: () => void;
}

export default function ReviewModal({
  productId,
  productName,
  reviewType,
  onClose,
  onSuccess,
}: ReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const { submitReview, isSubmitting } = useReview();

  const handleSubmit = async () => {
    if (rating === 0) { toast.warning("별점을 선택해주세요."); return; }
    try {
      await submitReview({ productId, rating, comment, reviewType });
      toast.success("리뷰가 등록되었습니다.");
      onSuccess();
    } catch {
      toast.error("리뷰 등록에 실패했습니다.");
    }
  };

  const targetLabel = reviewType === "BUYER_TO_SELLER" ? "판매자" : "구매자";

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>{targetLabel}에게 리뷰 작성</DialogTitle>
          <DialogDescription className="truncate text-sm">{productName}</DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* 별점 */}
          <div className="flex flex-col items-center gap-2">
            <p className="text-muted-foreground text-sm">거래는 어떠셨나요?</p>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHovered(star)}
                  onMouseLeave={() => setHovered(0)}
                  onClick={() => setRating(star)}
                  className="transition-transform hover:scale-110"
                  aria-label={`${star}점`}
                >
                  <Star
                    className={`h-9 w-9 ${
                      star <= (hovered || rating)
                        ? "fill-amber-400 text-amber-400"
                        : "text-muted-foreground/40"
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-foreground text-sm font-semibold">
                {["", "별로예요", "그저 그래요", "보통이에요", "좋아요", "최고예요"][rating]}
              </p>
            )}
          </div>

          {/* 코멘트 */}
          <Textarea
            placeholder={`${targetLabel}와의 거래 경험을 자유롭게 작성해주세요. (선택)`}
            value={comment}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setComment(e.target.value)}
            maxLength={200}
            rows={3}
          />
          <p className="text-muted-foreground text-right text-xs">{comment.length}/200</p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>취소</Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "등록 중..." : "리뷰 등록"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
