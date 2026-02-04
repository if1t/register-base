export interface HasuraGqlError {
  extensions: {
    code: string;
    path: string;
  };
  message: string;
}

export interface HbGqlErrors {
  errors: HasuraGqlError[];
  graphQLErrors?: HasuraGqlError[];
}

export type HasuraError = HbGqlErrors | string;

export interface HasuraErrorInternal {
  error: {
    description: string | null;
    exec_status: string;
    hint: string | null;
    message: string;
  };
}

export interface HasuraErrorExtensions {
  code: string;
  internal: HasuraErrorInternal;
}

export interface GraphQLError {
  message: string;
  extensions: HasuraErrorExtensions;
}

export interface ApolloError {
  message: string;
  graphQLErrors: GraphQLError[];
  clientErrors: any[];
  extraInfo?: any;
  cause?: Error;
}
