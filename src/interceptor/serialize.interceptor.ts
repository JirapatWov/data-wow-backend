import {
  UseInterceptors,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { plainToInstance } from 'class-transformer';

export function Serialize(dto: any) {
  return UseInterceptors(new SerializeInterceptor(dto));
}

export class SerializeInterceptor implements NestInterceptor {
  constructor(private dto: any) {}

  intercept(context: ExecutionContext, handler: CallHandler): Observable<any> {
    return handler.handle().pipe(
      map((response: any) => {
        // Check if response has a 'data' property and it's an array
        if (response && response.data && Array.isArray(response.data)) {
          // Apply serialization to each item in the data array
          const serializedData = response.data.map((item) =>
            plainToInstance(this.dto, item, {
              excludeExtraneousValues: true,
            }),
          );

          // Return the full response with serialized data
          return {
            ...response,
            data: serializedData,
          };
        }

        // Handle the case where response is not in the expected format
        return plainToInstance(this.dto, response, {
          excludeExtraneousValues: true,
        });
      }),
    );
  }
}

export function CustomSerialize(customDto: { key: string; dto: any }) {
  return UseInterceptors(new CustomSerializeInterceptor(customDto));
}

export class CustomSerializeInterceptor implements NestInterceptor {
  constructor(private customDto: { key: string; dto: any }) {}

  intercept(context: ExecutionContext, handler: CallHandler): Observable<any> {
    return handler.handle().pipe(
      map((response: any) => {
        return this.applySerialization(
          response,
          this.customDto.key,
          this.customDto.dto,
        );
      }),
    );
  }

  private applySerialization(data: any, key: string, dto: any): any {
    if (Array.isArray(data)) {
      return data.map((item) => this.applySerialization(item, key, dto));
    } else if (data !== null && typeof data === 'object') {
      if (data instanceof Date) {
        return data;
      }
      const newData = { ...data };
      Object.keys(newData).forEach((propKey) => {
        if (propKey === key && newData[propKey]) {
          newData[propKey] = plainToInstance(dto, newData[propKey], {
            excludeExtraneousValues: true,
          });
        } else {
          newData[propKey] = this.applySerialization(
            newData[propKey],
            key,
            dto,
          );
        }
      });
      return newData;
    }
    return data;
  }
}

// export class CustomSerializeInterceptor implements NestInterceptor {
//   constructor(private customDto: {
//     key:string,
//     dto:any
//   }) {}

//   intercept(context: ExecutionContext, handler: CallHandler): Observable<any> {
//     return handler.handle().pipe(
//       map((response: any) => {
//         // Check if response has a 'data' property and it's an array
//         if (response && response.data && Array.isArray(response.data)) {
//           // Apply serialization to each item in the data array
//           const serializedData = response.data.map((item) =>
//             plainToInstance(this.dto, item, {
//               excludeExtraneousValues: true,
//             }),
//           );

//           // Return the full response with serialized data
//           return {
//             ...response,
//             data: serializedData,
//           };
//         }

//         // Handle the case where response is not in the expected format
//         return plainToInstance(this.dto, response, {
//           excludeExtraneousValues: true,
//         });
//       }),
//     );
//   }
// }
