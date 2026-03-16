import { locales, pathnames } from './constants';
import { useRouter } from './routing';

export type Pathname = keyof typeof pathnames;
export type Locale = (typeof locales)[number];

export type Href = Parameters<ReturnType<typeof useRouter>['push']>[0];
