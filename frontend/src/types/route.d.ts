/**
 * @file
 * @description
 * -----------------------------------------------------
 * Archivo que contiene los tipados de router
 * -----------------------------------------------------
 * @version 0.0.1a
 * @created 2024-12-19
 * @author Kotrip
 * @copyright © Kotrip
 * @license Private
 * */
import { LucideIcon } from 'lucide-react';

export interface Route {
  path: string;
  label: string;
  roles: UserRoles[];
  icon?: LucideIcon;
  hidden?: boolean;
  children?: Route[];
}
