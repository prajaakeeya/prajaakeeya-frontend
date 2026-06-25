import * as yup from 'yup';

export const phoneSchema = yup
  .string()
  .required('validation.required')
  .matches(/^[6-9]\d{9}$/i, 'validation.phone');

export const emailSchema = yup
  .string()
  .required('validation.required')
  .email('validation.email');

export const otpSchema = yup
  .string()
  .required('validation.required')
  .matches(/^\d{6}$/i, 'validation.otp');

export const epicIdSchema = yup
  .string()
  .required('validation.required')
  .matches(/^[A-Z]{3}\d{7}$/, 'validation.epicid')
  .length(10, 'validation.epicid');

export const wardSchema = yup.object({
  number: yup.string().required('validation.required'),
  name: yup.string().required('validation.required'),
  state: yup.string().required('validation.required'),
  category: yup.string().required('validation.required'),
  municipality: yup.string().required('validation.required'),
  parliamentary: yup.string().optional(),
  assembly: yup.string().optional(),
});

// Minimum age requirements by election type
const MIN_AGE_BY_ELECTION_TYPE: Record<string, number> = {
  lok_sabha: 25,
  state_assembly: 25,
  municipal_corporation: 21,
  gram_panchayat: 21,
};
const DEFAULT_MIN_AGE = 21;

export const getMinAgeForElectionType = (electionType: string): number =>
  MIN_AGE_BY_ELECTION_TYPE[electionType] ?? DEFAULT_MIN_AGE;

export const createAspirantSchema = (getElectionType: () => string) => yup.object({
  name: yup.string().required('validation.required'),
  manifesto: yup.string().required('validation.required'),
  // Optional — an aspirant can register before an election is announced and
  // declare their constituency later. If one of the pair is set, the other
  // must be too (you can't have a constituency without an election or vice versa).
  // The form's default value is '' (not undefined). yup.number()'s *built-in*
  // coercion runs before any .transform() we add, and it casts '' to NaN —
  // so by the time our transform sees the value, it's already NaN, not ''.
  // Catch NaN (not '') and map it to undefined so an empty field is treated
  // as "not provided" rather than an invalid number.
  electionId: yup.number()
    .transform((value) => (typeof value === 'number' && Number.isNaN(value) ? undefined : value))
    .typeError('validation.required').optional()
    .test('election-with-constituency', 'validation.required', function (value) {
      return !this.parent.constituencyId || value !== undefined;
    }),
  constituencyId: yup.number()
    .transform((value) => (typeof value === 'number' && Number.isNaN(value) ? undefined : value))
    .typeError('validation.required').optional()
    .test('constituency-with-election', 'validation.required', function (value) {
      return !this.parent.electionId || value !== undefined;
    }),
  phone: yup.string().optional().test(
    'phone-optional',
    'validation.phone',
    (value) => !value || value.trim() === '' || /^[6-9]\d{9}$/.test(value)
  ),
  instagramLink: yup
    .string()
    .optional()
    .test('instagram-url', 'validation.instagramLink', (value) => {
      if (!value || value.trim() === '') return true;
      return /^https?:\/\/(www\.)?instagram\.com\/.+/i.test(value.trim());
    }),
  facebookLink: yup
    .string()
    .optional()
    .test('facebook-url', 'validation.facebookLink', (value) => {
      if (!value || value.trim() === '') return true;
      return /^https?:\/\/(www\.)?facebook\.com\/.+/i.test(value.trim());
    }),
  linkedinLink: yup
    .string()
    .optional()
    .test('linkedin-url', 'validation.linkedinLink', (value) => {
      if (!value || value.trim() === '') return true;
      return /^https?:\/\/(www\.)?([a-z]{2}\.)?linkedin\.com\/.+/i.test(value.trim());
    }),
  twitterLink: yup
    .string()
    .optional()
    .test('twitter-url', 'validation.twitterLink', (value) => {
      if (!value || value.trim() === '') return true;
      return /^https?:\/\/(www\.)?(twitter\.com|x\.com)\/.+/i.test(value.trim());
    }),
  whatsappNumber: yup
    .string()
    .optional()
    .test('whatsapp-number', 'validation.whatsappNumber', (value) => {
      if (!value || value.trim() === '') return true;
      return /^[6-9]\d{9}$/.test(value.trim());
    }),
  age: yup
    .number()
    .typeError('validation.required')
    .required('validation.required')
    .integer('validation.ageInteger')
    .max(150, 'validation.ageRange')
    .test('min-age-election', '', function (value) {
      if (!value) return true;
      const electionType = getElectionType();
      const minAge = getMinAgeForElectionType(electionType);
      if (value >= minAge) return true;
      return this.createError({ message: `validation.ageMinElection:${minAge}` });
    }),
});

// Backwards-compatible static schema (uses default min age of 21)
export const aspirantSchema = createAspirantSchema(() => '');

export const voteSchema = yup.object({
  wardId: yup.number().required('validation.required'),
  aspirantId: yup.number().required('validation.required')
});
