// UNIT TESTS for src/utils/profileUtils.ts
import { isProfileComplete, getMissingProfileFields } from '../utils/profileUtils';
import { AuthUser } from '../types/auth';

// A fully-complete non-admin user. We use Partial<AuthUser> to avoid specifying every field.
const completeUser: Partial<AuthUser> = {
  role: 'voter',
  name: 'Asha',
  gender: 'female',
  phone: '9876543210',
  profilePicture: 'http://img/a.jpg',
  age: 28,
};

describe('isProfileComplete', () => {
  it('returns false for null', () => {
    expect(isProfileComplete(null)).toBe(false);
  });

  it('returns true for an admin regardless of fields', () => {
    expect(isProfileComplete({ role: 'admin' } as AuthUser)).toBe(true);
  });

  it('returns true when all required fields are present', () => {
    expect(isProfileComplete(completeUser)).toBe(true);
  });

  it('returns false when a required field is missing', () => {
    expect(isProfileComplete({ ...completeUser, phone: undefined })).toBe(false);
    expect(isProfileComplete({ ...completeUser, profilePicture: '' })).toBe(false);
  });
});

describe('getMissingProfileFields', () => {
  it('returns ["All fields"] for null', () => {
    expect(getMissingProfileFields(null)).toEqual(['All fields']);
  });

  it('returns [] when nothing is missing', () => {
    expect(getMissingProfileFields(completeUser)).toEqual([]);
  });

  it('lists the missing field labels', () => {
    const missing = getMissingProfileFields({
      ...completeUser,
      phone: undefined,
      age: undefined,
    });
    expect(missing).toContain('Mobile Number');
    expect(missing).toContain('Age');
    expect(missing).not.toContain('Full Name');
  });
});
