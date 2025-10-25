import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

function convertScreamingSnakeToCamelCase(input) {
  if (Array.isArray(input)) {
    return input.map((item) => convertScreamingSnakeToCamelCase(item));
  } else if (input instanceof Date) {
    return input;
  } else if (input !== null && typeof input === 'object') {
    const newObj = {};
    Object.keys(input).forEach((key) => {
      newObj[toCamelCase(key)] = convertScreamingSnakeToCamelCase(input[key]);
    });
    return newObj;
  }
  return input;
}

function isCamelCase(str) {
  // Check if the string has any uppercase letters following lowercase ones
  return /[a-z][A-Z]/.test(str);
}

function toCamelCase(str) {
  // If the string is already in camel case, return it as is
  if (isCamelCase(str)) {
    return str;
  }
  // Convert to camel case
  return str.toLowerCase().replace(/(_[a-z])/g, ($1) => {
    return $1.toUpperCase().replace('_', '');
  });
}

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next
      .handle()
      .pipe(map((data) => convertScreamingSnakeToCamelCase(data)));
  }
}
