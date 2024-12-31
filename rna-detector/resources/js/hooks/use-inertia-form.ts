import { PageProps } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Method, Page, Progress, router, VisitOptions } from "@inertiajs/core";
import { AxiosProgressEvent } from "axios";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  DefaultValues,
  FieldValues,
  Path,
  SubmitErrorHandler,
  useForm as useReactForm,
} from "react-hook-form";
import { z } from "zod";

type Defined<T> = Exclude<T, undefined>;
type FormType = Parameters<typeof router.post>[1];
type AllVisitOptions = Defined<Parameters<typeof router.post>[2]>;
type CancelTokenType = Parameters<Defined<AllVisitOptions["onCancelToken"]>>[0];
type Timeout = ReturnType<typeof setTimeout>;

type InertiaPromise = Promise<{
  page: Page<PageProps>;
  isMounted: boolean;
}>;

export type InertiaPromiseError<TForm extends FormType> = {
  errors: Partial<Record<keyof TForm, string>>;
  isMounted: boolean;
};

export interface InertiaFormProps<TForm extends FormType> {
  errors: Partial<Record<keyof TForm, string>>;
  hasErrors: boolean;
  processing: boolean;
  progress?: Progress | null;
  wasSuccessful: boolean;
  recentlySuccessful: boolean;
  clearErrors: (...fields: (keyof TForm)[]) => void;

  setError(field: keyof TForm, value: string): void;

  setError(errors: Record<keyof TForm, string>): void;

  submit: (
    data: TForm,
    method: Method,
    url: string,
    options?: VisitOptions,
  ) => void;
  get: (data: TForm, url: string, options?: VisitOptions) => void;
  patch: (data: TForm, url: string, options?: VisitOptions) => void;
  post: (data: TForm, url: string, options?: VisitOptions) => void;
  put: (data: TForm, url: string, options?: VisitOptions) => void;
  delete: (data: TForm, url: string, options?: VisitOptions) => void;
  cancel: () => void;
  promises: {
    submit: (
      data: TForm,
      method: Method,
      url: string,
      options?: VisitOptions,
    ) => InertiaPromise;
    get: (data: TForm, url: string, options?: VisitOptions) => InertiaPromise;
    patch: (data: TForm, url: string, options?: VisitOptions) => InertiaPromise;
    post: (data: TForm, url: string, options?: VisitOptions) => InertiaPromise;
    put: (data: TForm, url: string, options?: VisitOptions) => InertiaPromise;
    delete: (
      data: TForm,
      url: string,
      options?: VisitOptions,
    ) => InertiaPromise;
  };
}

function isInertiaPromiseError<TForm extends FormType>(
  error: unknown,
): error is InertiaPromiseError<TForm> {
  return (
    typeof error === "object" &&
    error !== null &&
    "errors" in error &&
    "isMounted" in error
  );
}

export default function useInertiaForm<
  TForm extends FormType,
>(): InertiaFormProps<TForm> {
  const isMounted = useRef<boolean | null>(null);
  const cancelToken = useRef<CancelTokenType | null>(null);
  const recentlySuccessfulTimeoutId = useRef<Timeout | null>(null);
  const [errors, setErrors] = useState(
    {} as Partial<Record<keyof TForm, string>>,
  );
  const [hasErrors, setHasErrors] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState<
    AxiosProgressEvent | null | undefined
  >(null);
  const [wasSuccessful, setWasSuccessful] = useState(false);
  const [recentlySuccessful, setRecentlySuccessful] = useState(false);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const submit = useCallback(
    (
      data: TForm,
      method: Method,
      url: URL | string,
      options: VisitOptions = {},
    ) => {
      const _options: AllVisitOptions = {
        ...options,
        onCancelToken: (token) => {
          cancelToken.current = token;

          if (options.onCancelToken) {
            return options.onCancelToken(token);
          }
        },
        onBefore: (visit) => {
          setWasSuccessful(false);
          setRecentlySuccessful(false);
          if (recentlySuccessfulTimeoutId.current)
            clearTimeout(recentlySuccessfulTimeoutId.current);
          if (options.onBefore) {
            return options.onBefore(visit);
          }
        },
        onStart: (visit) => {
          setProcessing(true);
          if (options.onStart) {
            return options.onStart(visit);
          }
        },
        onProgress: (event) => {
          setProgress(event);
          if (options.onProgress) {
            return options.onProgress(event);
          }
        },
        onSuccess: (page) => {
          if (isMounted.current) {
            setProcessing(false);
            setProgress(null);
            setErrors({});
            setHasErrors(false);
            setWasSuccessful(true);
            setRecentlySuccessful(true);
            recentlySuccessfulTimeoutId.current = setTimeout(() => {
              if (isMounted.current) {
                setRecentlySuccessful(false);
              }
            }, 2000);
          }
          if (options.onSuccess) {
            return options.onSuccess(page);
          }
        },
        onError: (errors) => {
          if (isMounted.current) {
            setProcessing(false);
            setProgress(null);
            setErrors(errors as Partial<Record<keyof TForm, string>>);
            setHasErrors(true);
          }
          if (options.onError) {
            return options.onError(errors);
          }
        },
        onCancel: () => {
          if (isMounted.current) {
            setProcessing(false);
            setProgress(null);
          }
          if (options.onCancel) {
            return options.onCancel();
          }
        },
        onFinish: (visit) => {
          if (isMounted.current) {
            setProcessing(false);
            setProgress(null);
          }
          cancelToken.current = null;
          if (options.onFinish) {
            return options.onFinish(visit);
          }
        },
      };
      if (method === "delete") {
        router.delete(url, { ..._options, data: data });
      } else {
        router[method](url, data, _options);
      }
    },
    [],
  );

  const submitPromise = useCallback(
    (
      data: TForm,
      method: Method,
      url: URL | string,
      options: VisitOptions = {},
    ): InertiaPromise => {
      return new Promise((resolve, reject) => {
        submit(data, method, url, {
          ...options,
          onSuccess: (page) => {
            resolve({
              page,
              isMounted: isMounted.current!,
            });
            if (options.onSuccess) return options.onSuccess(page);
          },
          onError: (errors) => {
            reject({
              errors,
              isMounted: isMounted.current!,
            } as InertiaPromiseError<TForm>);
            if (options.onError) return options.onError(errors);
          },
        });
      });
    },
    [submit],
  );

  return {
    errors,
    hasErrors,
    processing,
    progress,
    wasSuccessful,
    recentlySuccessful,
    setError(
      fieldOrFields: keyof TForm | Record<keyof TForm, string> | string,
      maybeValue?: string,
    ) {
      setErrors((errors) => {
        const newErrors = {
          ...errors,
          ...(typeof fieldOrFields === "string"
            ? { [fieldOrFields]: maybeValue }
            : (fieldOrFields as Record<keyof TForm, string>)),
        };
        setHasErrors(Object.keys(newErrors).length > 0);
        return newErrors;
      });
    },
    clearErrors(...fields) {
      setErrors((errors) => {
        const newErrors = (Object.keys(errors) as Array<keyof TForm>).reduce(
          (carry, field) => ({
            ...carry,
            ...(fields.length > 0 && !fields.includes(field)
              ? { [field]: errors[field] }
              : {}),
          }),
          {},
        );
        setHasErrors(Object.keys(newErrors).length > 0);
        return newErrors;
      });
    },
    submit,
    get(data, url, options) {
      submit(data, "get", url, options);
    },
    post(data, url, options) {
      submit(data, "post", url, options);
    },
    put(data, url, options) {
      submit(data, "put", url, options);
    },
    patch(data, url, options) {
      submit(data, "patch", url, options);
    },
    delete(data, url, options) {
      submit(data, "delete", url, options);
    },
    cancel() {
      if (cancelToken.current) {
        cancelToken.current.cancel();
      }
    },
    promises: {
      submit: submitPromise,
      get(data, url, options) {
        return submitPromise(data, "get", url, options);
      },
      post(data, url, options) {
        return submitPromise(data, "post", url, options);
      },
      put(data, url, options) {
        return submitPromise(data, "put", url, options);
      },
      patch(data, url, options) {
        return submitPromise(data, "patch", url, options);
      },
      delete(data, url, options) {
        return submitPromise(data, "delete", url, options);
      },
    },
  };
}

type SubmitHandlerReturn<TFieldValues extends FieldValues> = {
  data: TFieldValues;
  method?: Method;
  url: string;
  options?: VisitOptions;
};

type SubmitHandler<TFieldValues extends FieldValues> = (
  data: TFieldValues,
  promises: InertiaFormProps<TFieldValues>["promises"],
  event?: React.BaseSyntheticEvent,
) =>
  | SubmitHandlerReturn<TFieldValues>
  | Promise<SubmitHandlerReturn<TFieldValues>>
  | Promise<void>;

export function useForm<TFieldValues extends FieldValues = FieldValues>(
  schema: z.Schema<TFieldValues, any>,
  defaultValues?: DefaultValues<TFieldValues>,
) {
  const {
    errors,
    hasErrors,
    processing,
    progress,
    wasSuccessful,
    recentlySuccessful,
    promises,
  } = useInertiaForm<TFieldValues>();

  const form = useReactForm<TFieldValues>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  return {
    form,
    handleSubmit: (
      onValid: SubmitHandler<TFieldValues>,
      onInvalid?: SubmitErrorHandler<TFieldValues>,
    ) => {
      return form.handleSubmit(async (values, event) => {
        try {
          const result = await onValid(values, promises, event);
          if (result) {
            const { data, method = "post", url, options } = result;
            await promises.submit(data, method, url, options);
          }
        } catch (e) {
          if (isInertiaPromiseError<TFieldValues>(e) && e.isMounted) {
            for (const [field, message] of Object.entries(e.errors)) {
              form.setError(field as Path<TFieldValues>, {
                type: "server",
                message,
              });
            }
          } else {
            console.error(e);
          }
        }
      }, onInvalid);
    },
    errors,
    hasErrors,
    processing,
    progress,
    wasSuccessful,
    recentlySuccessful,
  };
}
