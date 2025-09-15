# CalorEase Authentication Setup

This document explains how to set up and use the authentication system in CalorEase.

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Get these values from your Supabase project settings:
1. Go to your Supabase dashboard
2. Navigate to Settings > API
3. Copy the Project URL and anon/public key

## Supabase Configuration

### 1. Enable Email Authentication
In your Supabase dashboard:
1. Go to Authentication > Settings
2. Enable "Enable email confirmations"
3. Configure your email templates if needed

### 2. Set Redirect URLs
Add these URLs to your Supabase project's redirect URLs:
- `http://localhost:3000/auth/callback` (for development)
- `https://yourdomain.com/auth/callback` (for production)

### 3. Database Schema (Optional)
The auth system works with Supabase's built-in auth tables. If you want to store additional user profile data, create a `profiles` table:

```sql
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  updated_at timestamp with time zone,
  username text unique,
  full_name text,
  avatar_url text,
  website text,

  constraint username_length check (char_length(username) >= 3)
);

-- Set up Row Level Security (RLS)
alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone." on profiles
  for select using (true);

create policy "Users can insert their own profile." on profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile." on profiles
  for update using (auth.uid() = id);

-- This trigger automatically creates a profile entry when a new user signs up via Supabase Auth.
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

## Features Included

### 🔐 Authentication Pages
- **Login Page** (`/auth/login`) - Email/password signin with validation
- **Signup Page** (`/auth/signup`) - User registration with email verification
- **Forgot Password** (`/auth/forgot-password`) - Password reset via email
- **Reset Password** (`/auth/reset-password`) - New password setup

### 🎨 UI Components
- Beautiful, responsive design using ShadCN UI
- Diet app themed with green color scheme
- Mobile-friendly layouts
- Loading states and error handling
- Password strength indicators
- Form validation with visual feedback

### 🛡️ Security Features
- Server-side authentication with Supabase
- Protected routes with middleware
- Email verification flow
- Secure password reset
- Session management
- CSRF protection

### 🚀 User Experience
- Toast notifications for feedback
- Smooth redirects
- Accessible forms with proper labels
- Keyboard navigation support
- Clear error messages

## Usage

### Development
1. Set up your environment variables
2. Configure Supabase settings
3. Run the development server:
   ```bash
   npm run dev
   ```

### Authentication Flow
1. Users visit the app and are redirected to `/auth/login`
2. New users can click "Sign up here" to create an account
3. Email verification is required for new accounts
4. Authenticated users are redirected to `/dashboard`
5. Password reset is available via "Forgot password?" link

### Customization
The authentication pages can be customized by:
- Modifying the styles in the component files
- Updating the branding in `/src/app/auth/layout.tsx`
- Changing the redirect URLs in the middleware
- Adding additional form fields as needed

## File Structure

```
src/
├── app/
│   ├── auth/
│   │   ├── layout.tsx          # Auth layout with branding
│   │   ├── login/page.tsx      # Login page
│   │   ├── signup/page.tsx     # Signup page
│   │   ├── forgot-password/page.tsx  # Password reset request
│   │   ├── reset-password/page.tsx   # Password reset form
│   │   └── callback/route.ts   # Email verification handler
│   ├── dashboard/page.tsx      # Protected dashboard
│   └── layout.tsx              # Root layout with toaster
├── lib/
│   └── auth.ts                 # Server actions for auth
├── utils/supabase/
│   ├── client.ts               # Client-side Supabase
│   ├── server.ts               # Server-side Supabase
│   └── middleware.ts           # Auth middleware
└── middleware.ts               # Next.js middleware
```

## Troubleshooting

### Common Issues
1. **"Could not authenticate user"** - Check your Supabase URL and keys
2. **Email not sending** - Verify email settings in Supabase dashboard
3. **Redirect loops** - Check middleware configuration and redirect URLs
4. **Session not persisting** - Ensure cookies are properly configured

### Support
For additional help, refer to the [Supabase Auth documentation](https://supabase.com/docs/guides/auth) or create an issue in the project repository.
