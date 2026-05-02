# Project Rules

- **Tech Stack**: Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui.
- **TypeScript**: Strict mode only. No `any` type allowed.
- **Styling**: Tailwind CSS only. No inline styles.
- **AI Output**: Every AI response must include the `---JSON_OUTPUT---` block for backend processing.
- **File Management**: Always call `@file` before editing.
- **Responsive**: Mobile-first design for all UI components.
- **Documentation**: Vietnamese comments for business logic; English for technical implementation.
- **Webhooks**: Parallel processing (Promise.allSettled) for Supabase, Google Sheets, and Telegram.
- **Production-Ready**: No placeholders. Every file must be ready for deployment.
