import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SearchIcon } from "lucide-react";
import {
  Dispatch,
  FormEvent,
  SetStateAction,
  useCallback,
  useRef,
} from "react";

export const SearchBar = ({
  query,
  setQuery,
}: {
  setQuery: Dispatch<SetStateAction<string>>;
  query: string;
}) => {
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = formData.get("query") as string | null;
    setQuery(query ?? "");
  };

  const searchInputRef = useCallback(
    (node: HTMLInputElement | null) => {
      if (!node) {
        return;
      }
      node.value = query;
    },
    [query],
  );

  return (
    <form onSubmit={onSubmit} className="flex gap-2 items-center">
      <Input
        ref={searchInputRef}
        placeholder="Search by file name"
        name="query"
      />
      <Button type="submit" size="sm">
        <SearchIcon />
      </Button>
    </form>
  );
};
