"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import type { ProductQuestion } from "@/types";

interface ProductQAProps {
  questions: ProductQuestion[];
  isLoading: boolean;
  isSubmitting: boolean;
  isOwner: boolean;
  isLoggedIn: boolean;
  onSubmitQuestion: (content: string) => Promise<void>;
  onSubmitAnswer: (questionId: number, content: string) => Promise<void>;
}

function formatDate(dateString: string): string {
  const d = new Date(dateString);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

function QuestionItem({
  question,
  isOwner,
  isSubmitting,
  onSubmitAnswer,
}: {
  question: ProductQuestion;
  isOwner: boolean;
  isSubmitting: boolean;
  onSubmitAnswer: (questionId: number, content: string) => Promise<void>;
}) {
  const [answerText, setAnswerText] = useState("");
  const [showAnswerForm, setShowAnswerForm] = useState(false);

  async function handleAnswer() {
    if (!answerText.trim()) return;
    await onSubmitAnswer(question.questionId, answerText.trim());
    setAnswerText("");
    setShowAnswerForm(false);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="overflow-hidden rounded-xl border border-border/50 bg-card/50"
    >
      {/* 질문 */}
      <div className="flex gap-3 px-4 py-4">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-500/15 text-xs font-bold text-amber-400">
          Q
        </span>
        <div className="min-w-0 flex-1 pt-0.5">
          <p className="text-sm leading-relaxed text-foreground">{question.content}</p>
          <p className="mt-2 text-xs text-muted-foreground">
            {question.askerNickname} · {formatDate(question.createdAt)}
          </p>
        </div>
      </div>

      {/* 답변 구분선 */}
      <div className="border-t border-border/50" />

      {/* 답변 영역 */}
      {question.answer ? (
        <div className="flex gap-3 bg-muted/20 px-4 py-4">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
            A
          </span>
          <div className="min-w-0 flex-1 pt-0.5">
            <p className="text-sm leading-relaxed text-foreground">{question.answer.content}</p>
            <p className="mt-2 text-xs text-muted-foreground">
              {question.answer.responderNickname} · {formatDate(question.answer.createdAt)}
            </p>
          </div>
        </div>
      ) : isOwner ? (
        <div className="bg-muted/10 px-4 py-4">
          {showAnswerForm ? (
            <div className="space-y-2.5">
              <textarea
                value={answerText}
                onChange={(e) => setAnswerText(e.target.value)}
                placeholder="답변을 입력하세요..."
                rows={3}
                className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <div className="flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowAnswerForm(false);
                    setAnswerText("");
                  }}
                  disabled={isSubmitting}
                >
                  취소
                </Button>
                <Button
                  size="sm"
                  onClick={handleAnswer}
                  disabled={!answerText.trim() || isSubmitting}
                >
                  답변 등록
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => setShowAnswerForm(true)}
            >
              답변하기
            </Button>
          )}
        </div>
      ) : (
        <div className="flex gap-3 bg-muted/10 px-4 py-3.5">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted/40 text-xs font-bold text-muted-foreground">
            A
          </span>
          <p className="pt-1 text-xs text-muted-foreground">아직 답변이 없습니다.</p>
        </div>
      )}
    </motion.div>
  );
}

export function ProductQA({
  questions,
  isLoading,
  isSubmitting,
  isOwner,
  isLoggedIn,
  onSubmitQuestion,
  onSubmitAnswer,
}: ProductQAProps) {
  const [questionText, setQuestionText] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const COLLAPSED_COUNT = 3;
  const visibleQuestions = showAll ? questions : questions.slice(0, COLLAPSED_COUNT);

  async function handleQuestion() {
    if (!questionText.trim()) return;
    await onSubmitQuestion(questionText.trim());
    setQuestionText("");
    setShowForm(false);
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* 질문 입력 폼 (판매자 제외) */}
      {!isOwner && (
        <div>
          {isLoggedIn ? (
            showForm ? (
              <div className="space-y-3 rounded-xl border border-border bg-card p-4">
                <textarea
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  placeholder="판매자에게 궁금한 점을 질문해 보세요..."
                  rows={3}
                  className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs text-muted-foreground">판매자가 확인 후 답변을 등록합니다.</p>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setShowForm(false);
                        setQuestionText("");
                      }}
                      disabled={isSubmitting}
                    >
                      취소
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleQuestion}
                      disabled={!questionText.trim() || isSubmitting}
                    >
                      질문하기
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <Button variant="outline" onClick={() => setShowForm(true)} className="text-sm">
                질문하기
              </Button>
            )
          ) : (
            <p className="text-sm text-muted-foreground">로그인 후 질문하실 수 있습니다.</p>
          )}
        </div>
      )}

      {/* 질문 목록 */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-muted/30" />
          ))}
        </div>
      ) : questions.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border/60 px-6 py-10 text-center">
          <p className="text-sm font-medium text-muted-foreground">아직 등록된 질문이 없습니다.</p>
          <p className="mt-1 text-xs text-muted-foreground/60">궁금한 점이 있으시면 질문을 남겨보세요.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {visibleQuestions.map((q) => (
              <QuestionItem
                key={q.questionId}
                question={q}
                isOwner={isOwner}
                isSubmitting={isSubmitting}
                onSubmitAnswer={onSubmitAnswer}
              />
            ))}
          </AnimatePresence>
          {questions.length > COLLAPSED_COUNT && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full"
              onClick={() => setShowAll(!showAll)}
            >
              {showAll ? "접기" : `더보기 (${questions.length - COLLAPSED_COUNT}개)`}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
