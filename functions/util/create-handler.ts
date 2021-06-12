import { Context, Handler } from 'aws-lambda';

type StatusCode = 200 | 400 | 500;
type HttpMethod = 'POST' | 'PUT' | 'PATCH' | 'GET' | 'DELETE';
type HeaderKeys = 'Authorization' | 'Content-Type';

interface CommonEvent<TParamKeys extends string = string> {
  path: string;
  httpMethod: HttpMethod;
  headers: Record<HeaderKeys, string>;
  queryStringParameters: Record<TParamKeys, string>;
  isBase64Encoded: boolean;
}

interface RawEvent extends CommonEvent {
  body?: string;
}

interface Event<TBody, TParamKeys extends string>
  extends CommonEvent<TParamKeys> {
  body?: TBody;
}

interface CommonResponse {
  statusCode: StatusCode;
}

interface RawResponse extends CommonResponse {
  body?: string;
}

interface Response<TBody> extends CommonResponse {
  body?: TBody;
}

export function createHandler<
  TEventBody = any,
  TParamKeys extends string = string
>(
  func: (
    event: Event<TEventBody, TParamKeys>,
    context: Context
  ) => Promise<Response<string>>
) {
  let handler: Handler<RawEvent, RawResponse> = async (rawEvent, context) => {
    const eventBody = rawEvent.body ? JSON.parse(rawEvent.body) : undefined;
    const event: Event<TEventBody, TParamKeys> = {
      ...rawEvent,
      body: eventBody,
    };

    const response = await func(event, context);

    const rawResponse: RawResponse = {
      ...response,
    };

    return rawResponse;
  };

  return handler;
}
