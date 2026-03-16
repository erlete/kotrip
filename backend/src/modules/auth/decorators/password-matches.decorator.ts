import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

/**
 * Decorador de validacion que comprueba que dos propiedades de un DTO son iguales.
 *
 * Se utiliza para verificar que la propiedad `repeatPassword` coincide con
 * la propiedad `password` durante el registro o cambio de contrasena.
 */

@ValidatorConstraint({ async: false })
class MatchPasswordsConstraint implements ValidatorConstraintInterface {
  defaultMessage(args: ValidationArguments) {
    return 'Passwords do not match';
  }

  validate(repeatPassword: any, args: ValidationArguments) {
    const [relatedPropertyName] = args.constraints;
    const password = (args.object as any)[relatedPropertyName];
    return repeatPassword === password;
  }
}

export function MatchPasswords(
  property: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      constraints: [property],
      options: validationOptions,
      propertyName: propertyName,
      target: object.constructor,
      validator: MatchPasswordsConstraint,
    });
  };
}
