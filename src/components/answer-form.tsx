"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";

const formSchema = z.object({
  answer: z
    .string()
    .min(1, { message: "답변을 입력해주세요." })
    .max(500, { message: "답변은 500자를 초과할 수 없습니다." }),
});

interface AnswerFormProps {
  relationshipHash: string;
  questionId: string;
}

export function AnswerForm({ relationshipHash, questionId }: AnswerFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      answer: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsSubmitting(true);
      const role = localStorage.getItem("userRole");
      
      const response = await fetch("/api/answers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          relationship_hash: relationshipHash,
          role,
          answer_text: values.answer,
        }),
      });

      if (!response.ok) {
        throw new Error("답변 제출에 실패했습니다.");
      }

      form.reset();
      router.refresh();
    } catch (error) {
      console.error("Error submitting answer:", error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="answer"
          render={({ field }) => (
            <FormItem>
              <FormLabel>답변</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="오늘 하루는 어땠나요?"
                  className="min-h-[150px] resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                최대 500자까지 입력할 수 있습니다.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "제출 중..." : "답변 제출"}
        </Button>
      </form>
    </Form>
  );
} 