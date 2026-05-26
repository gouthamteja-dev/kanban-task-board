import { defaultFieldResolver, GraphQLSchema } from 'graphql';
import { getDirective, MapperKind, mapSchema } from '@graphql-tools/utils';

export function applyUppercaseDirective(schema: GraphQLSchema) {
  return mapSchema(schema, {
    [MapperKind.OBJECT_FIELD]: (fieldConfig) => {
      const directive = getDirective(schema, fieldConfig, 'uppercase')?.[0];
      if (!directive) return fieldConfig;

      const originalResolve = fieldConfig.resolve ?? defaultFieldResolver;
      fieldConfig.resolve = async (source, args, context, info) => {
        const result = await originalResolve(source, args, context, info);
        return typeof result === 'string' ? result.toUpperCase() : result;
      };
      return fieldConfig;
    },
  });
}
