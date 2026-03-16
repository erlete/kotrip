import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

/**
 * Decorador para comprobar que dos propiedades de un DTO son iguales, en este caso
 * estamos comprobando que la propiedad repeatPassword sea igual a la propiedad password
 *
 * @version     1.0.0a




 * @see         [registerDecorator]
 * @see         [ValidationOptions]
 * @see         [ValidatorConstraint]
 * @see         [ValidatorConstraintInterface]
 * @see         [ValidationArguments]
 * */

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
