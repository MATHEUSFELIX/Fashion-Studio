import { useEffect, useState, type DependencyList } from "react";

interface AsyncState<T> {
  data?: T;
  error?: string;
  isLoading: boolean;
}

export function useAsync<T>(load: () => Promise<T>, deps: DependencyList): AsyncState<T> {
  const [state, setState] = useState<AsyncState<T>>({ isLoading: true });

  useEffect(() => {
    let active = true;
    setState({ isLoading: true });

    load()
      .then((data) => {
        if (active) {
          setState({ data, isLoading: false });
        }
      })
      .catch((error: unknown) => {
        if (active) {
          setState({
            error: error instanceof Error ? error.message : "Something went wrong.",
            isLoading: false,
          });
        }
      });

    return () => {
      active = false;
    };
    // The caller owns the dependency list for the load function.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return state;
}
