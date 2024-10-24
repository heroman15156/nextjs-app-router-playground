import { z } from "zod";

export const signupSchema = z
  .object({
    name: z
      .string()
      .min(2, "이름은 2자 이상이어야 합니다.")
      .max(10, "이름은 10자를 초과할 수 없습니다."),
    email: z
      .string()
      .min(1, "이메일은 필수 입력사항입니다.")
      .email("이메일 형식이어야 합니다."),
    password: z.string().min(8, "비밀번호는 최소 8자 이상이어야 합니다."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "비밀번호가 일치하지 않습니다.",
    path: ["confirmPassword"],
  });

export type SignupInput = z.infer<typeof signupSchema>;
