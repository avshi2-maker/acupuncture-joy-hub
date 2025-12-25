# TCM Clinic - Progress Tracker

## Phase 0: Therapist Gate System ✅

### Configuration
- **Payment Partner**: Invoice4U (https://www.invoice4u.co.il/)
- **Dr. Roni Sapir WhatsApp**: 050-5231042
- **Dr. Roni Admin Email**: Avshi2@gmail.com

### Database Schema (Lovable Cloud)

#### Enums
- `app_role`: admin, therapist, patient
- `subscription_tier`: trial, standard, premium
- `registration_status`: pending, trial, active, expired

#### Tables
| Table | Description | RLS |
|-------|-------------|-----|
| `therapist_registrations` | Stores therapist sign-ups pending approval | ✅ |
| `access_passwords` | Passwords managed by Dr. Roni for gate login | ✅ |
| `user_roles` | Secure role storage (admin/therapist/patient) | ✅ |
| `access_logs` | Login and action tracking | ✅ |

#### Security Functions
- `has_role(user_id, role)` - Security definer to check user roles

### Routes

| Route | Purpose | Auth Required |
|-------|---------|---------------|
| `/` | Landing page (existing) | No |
| `/therapist-register` | Registration form for new therapists | No |
| `/pricing` | 3-tier pricing comparison | No |
| `/payment-instructions` | Invoice4U + WhatsApp Dr. Roni | No |
| `/gate` | Password entry for therapists | No |
| `/admin` | Dr. Roni's management panel | Yes (Avshi2@gmail.com) |
| `/dashboard` | Therapist workspace with tier-gated features | Password |
| `/auth` | Admin login/signup | No |

### Pricing Tiers

| Tier | Price | Features |
|------|-------|----------|
| Trial | Free (7 days) | TCM Brain, Calendar, CRM, Body Map |
| Standard | ₪40 + VAT | All Trial + SMS & WhatsApp reminders |
| Premium | ₪50 + VAT | All Standard + Video sessions |

### Files Created

#### Pages
- `src/pages/TherapistRegister.tsx` - Registration form
- `src/pages/Pricing.tsx` - Tier comparison
- `src/pages/PaymentInstructions.tsx` - Payment flow
- `src/pages/Gate.tsx` - Password login
- `src/pages/Admin.tsx` - Dr. Roni admin panel
- `src/pages/Dashboard.tsx` - Therapist workspace
- `src/pages/Auth.tsx` - Admin authentication

#### Hooks
- `src/hooks/useAuth.tsx` - Authentication state management
- `src/hooks/useTier.tsx` - Tier-based feature access

#### Components
- `src/components/layout/TierBadge.tsx` - Tier display badge
- `src/components/pricing/TierCard.tsx` - Pricing card component

---

## Next Phases (Planned)

### Phase 1: TCM Brain
- Knowledge base with search
- Categories: herbs, acupuncture points, conditions
- AI-powered suggestions

### Phase 2: Calendar & Booking
- Appointment scheduling
- Availability management
- Patient booking

### Phase 3: CRM
- Patient management
- Treatment history
- Notes and files

### Phase 4: Body Map
- Interactive body diagram
- Point selection
- Condition mapping

### Phase 5: Communications
- SMS reminders (Standard+)
- WhatsApp integration (Standard+)
- Automated notifications

### Phase 6: Video Sessions
- Video call integration (Premium)
- Session recording
- Screen sharing

---

## Handover Notes

### To Continue Development:
1. Admin user (Avshi2@gmail.com) needs to be created and assigned admin role
2. Run SQL to add admin role:
   ```sql
   INSERT INTO user_roles (user_id, role) 
   SELECT id, 'admin' FROM auth.users WHERE email = 'Avshi2@gmail.com';
   ```

### Current Status:
- ✅ Database schema complete with RLS
- ✅ All Phase 0 pages built
- ✅ Password-based gate system working
- ✅ Admin panel for password generation
- ✅ Tier-based dashboard with feature locking

### Known Limitations:
- Password hashing simplified (should use bcrypt in production)
- Video sessions placeholder (needs integration)
- SMS/WhatsApp placeholders (need API integration)
