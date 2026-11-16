This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Backend API configuration

Set `NEXT_PUBLIC_API_URL` to the backend API's absolute URL before starting the app or creating a production build. HTTPS is required in production. HTTP is permitted outside production for development compatibility, but sends credentials and tokens without transport encryption; use it only in a trusted development environment. Next.js embeds `NEXT_PUBLIC_` values into the browser bundle at build time, so configure the value for the environment where the build will run. Do not include credentials or secrets in this URL.

## Role dashboard routes

Successful login routes users using the role returned by the authentication API:

| Role | Dashboard route |
| --- | --- |
| Super Admin | `/super-admin` |
| Admin | `/admin` |
| Principal | `/principal` |
| Finance | `/finance` |
| HR | `/hr` |
| Student | `/students` |
| Teacher | `/teachers` |
| Parent | `/parents` |

Principal, finance, and HR modules are organized outside `app/admin`. Previous `/admin/academic`, `/admin/finance`, and `/admin/hr` URLs redirect to their new routes. Teacher and parent dashboard data/pages are not implemented yet; those routes display a notice instead of fabricated dashboard data.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
