"use client";
import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { apiPost } from "@/lib/api";
import { AUTH_POLICIES } from "@/lib/constants";

export function useSignupForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    nickname: "",
    phoneNumber: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const validateField = (
    name: string,
    value: string,
    nextFormData: typeof formData,
  ) => {
    const fieldErrors: Record<string, string> = {};

    if (name === "email") {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        fieldErrors.email = "유효한 이메일을 입력해주세요.";
      }
    }

    if (name === "password") {
      if (!AUTH_POLICIES.PASSWORD_POLICY.test(value)) {
        fieldErrors.password =
          "비밀번호는 10자 이상이며 대문자, 소문자, 숫자, 특수문자를 모두 포함해야 합니다.";
      }
      if (nextFormData.confirmPassword) {
        if (value !== nextFormData.confirmPassword) {
          fieldErrors.confirmPassword = "비밀번호가 일치하지 않습니다.";
        }
      }
    }

    if (name === "confirmPassword") {
      if (value !== nextFormData.password) {
        fieldErrors.confirmPassword = "비밀번호가 일치하지 않습니다.";
      }
    }

    if (name === "nickname") {
      if (!value.trim()) {
        fieldErrors.nickname = "닉네임을 입력해주세요.";
      } else if (!AUTH_POLICIES.NICKNAME_POLICY.test(value)) {
        fieldErrors.nickname =
          "닉네임은 공백 없이 한글 또는 영문만 사용할 수 있습니다.";
      } else if (
        value.length < AUTH_POLICIES.NICKNAME_MIN_LENGTH ||
        value.length > AUTH_POLICIES.NICKNAME_MAX_LENGTH
      ) {
        fieldErrors.nickname = `닉네임은 ${AUTH_POLICIES.NICKNAME_MIN_LENGTH}~${AUTH_POLICIES.NICKNAME_MAX_LENGTH}자 이내로 입력해주세요.`;
      }
    }

    if (name === "phoneNumber") {
      if (!value.match(/^\d{10,11}$/)) {
        fieldErrors.phoneNumber =
          "유효한 전화번호를 입력해주세요. (10~11자리 숫자)";
      }
    }

    return fieldErrors;
  };

  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "유효한 이메일을 입력해주세요.";
    }
    if (!AUTH_POLICIES.PASSWORD_POLICY.test(formData.password)) {
      newErrors.password =
        "비밀번호는 10자 이상이며 대문자, 소문자, 숫자, 특수문자를 모두 포함해야 합니다.";
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "비밀번호가 일치하지 않습니다.";
    }
    if (!formData.nickname.trim()) {
      newErrors.nickname = "닉네임을 입력해주세요.";
    } else if (!AUTH_POLICIES.NICKNAME_POLICY.test(formData.nickname)) {
      newErrors.nickname =
        "닉네임은 공백 없이 한글 또는 영문만 사용할 수 있습니다.";
    } else if (
      formData.nickname.length < AUTH_POLICIES.NICKNAME_MIN_LENGTH ||
      formData.nickname.length > AUTH_POLICIES.NICKNAME_MAX_LENGTH
    ) {
      newErrors.nickname = `닉네임은 ${AUTH_POLICIES.NICKNAME_MIN_LENGTH}~${AUTH_POLICIES.NICKNAME_MAX_LENGTH}자 이내로 입력해주세요.`;
    }
    if (!formData.phoneNumber.match(/^\d{10,11}$/)) {
      newErrors.phoneNumber =
        "유효한 전화번호를 입력해주세요. (10~11자리 숫자)";
    }
    if (!termsAccepted) {
      newErrors.terms = "약관에 동의해야 합니다.";
    }
    return newErrors;
  }, [formData, termsAccepted]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const sanitizedValue =
      name === "phoneNumber"
        ? value.replace(/\D/g, "").slice(0, 11)
        : name === "nickname"
          ? value.slice(0, AUTH_POLICIES.NICKNAME_MAX_LENGTH)
          : value;
    setFormData((prev) => {
      const nextFormData = {
        ...prev,
        [name]: sanitizedValue,
      } as typeof formData;
      setErrors((prevErrors) => {
        const updatedErrors = { ...prevErrors };
        delete updatedErrors.form;

        const fieldErrors = validateField(name, sanitizedValue, nextFormData);
        const affectedKeys = new Set<string>([
          name,
          ...(name === "password" ? ["confirmPassword"] : []),
          ...Object.keys(fieldErrors),
        ]);

        affectedKeys.forEach((key) => {
          if (fieldErrors[key]) {
            updatedErrors[key] = fieldErrors[key];
          } else {
            delete updatedErrors[key];
          }
        });

        return updatedErrors;
      });
      return nextFormData;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { confirmPassword, ...signupData } = formData;

      await apiPost("/api/auth/sign-up", signupData);

      alert("회원가입에 성공했습니다. 로그인 페이지로 이동합니다.");
      router.push("/login");
    } catch (error) {
      const err = error as Error;
      // 403 Forbidden (중복 이메일 또는 기타 제한)
      if (err.message.includes("403")) {
        alert("이미 가입된 이메일입니다.");
      } else {
        alert(err.message || "회원가입에 실패했습니다. 다시 시도해주세요.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = useMemo(
    () => Object.keys(validateForm()).length === 0,
    [validateForm],
  );

  return {
    formData,
    errors,
    isLoading,
    isFormValid,
    termsAccepted,
    setTermsAccepted,
    handleChange,
    handleSubmit,
  };
}
