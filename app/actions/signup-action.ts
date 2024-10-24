"use server";

import { signupSchema } from "@/app/lib/validation/auth";

export async function signup(prevState: any, formData: FormData) {
  const rowFormData = {
    name: formData.get("name")?.toString(),
    email: formData.get("email")?.toString(),
    password: formData.get("password")?.toString(),
    confirmPassword: formData.get("confirmPassword")?.toString(),
  };

  const validatedFields = signupSchema.safeParse(rowFormData);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors as any,
      message: "입력 정보를 확인해주세요.",
    };
  }

  return {
    success: true,
    message: "회원가입이 완료되었습니다.",
  };
}
