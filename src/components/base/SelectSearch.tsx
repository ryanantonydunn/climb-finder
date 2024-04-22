import React from "react";
import { TextInput, TextInputProps } from "./TextInput";
import { Loading } from "./Loading";

interface SelectSearchProps extends TextInputProps {
  onItemSelect: (value: unknown) => void;
  onTextChange: (str: string) => void;
  text: string;
  apiUrl: string;
  delayLoading?: boolean;
}

interface SelectSearchItem {
  name: string;
  value: unknown;
}

export function SelectSearch({
  onItemSelect,
  onTextChange,
  text,
  onChange,
  value,
  apiUrl,
  delayLoading = false,
  ...otherProps
}: SelectSearchProps) {
  const [items, setItems] = React.useState<SelectSearchItem[] | undefined>();
  const [itemListOpen, setItemListOpen] = React.useState(false);
  const elRef = React.useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  // run search
  const searchTimeout = React.useRef<
    ReturnType<typeof setTimeout> | undefined
  >();
  const search = React.useCallback(
    (str: string) => {
      async function runSearch() {
        setItemListOpen(true);
        setIsLoading(true);
        try {
          const res = await fetch(`${apiUrl}?q=${str})`);
          const json = await res.json();
          setItems(json);
        } catch (e) {
          console.error(e);
        }
        setIsLoading(false);
      }
      runSearch();
    },
    [apiUrl]
  );
  const queueSearch = React.useCallback(
    (str: string) => {
      if (delayLoading) {
        clearTimeout(searchTimeout.current);
        searchTimeout.current = setTimeout(() => search(str), 1000);
      } else {
        search(str);
      }
    },
    [search, delayLoading]
  );

  // Close window when clicking anywhere else
  React.useEffect(() => {
    function closePopup(e: MouseEvent) {
      if (itemListOpen && !elRef.current?.contains(e.target as Element)) {
        setItemListOpen(false);
      }
    }
    document.body.addEventListener("click", closePopup);
    return () => {
      document.body.removeEventListener("click", closePopup);
    };
  }, [itemListOpen]);

  // TODO keyboard nav

  return (
    <div className="relative" ref={elRef}>
      <TextInput
        {...otherProps}
        value={text}
        onChange={(e) => {
          setItems(undefined);
          const str = e.currentTarget.value;
          onTextChange(str);
          if (str.length >= 3) {
            queueSearch(str);
          }
        }}
        onFocus={() => {
          if (items === undefined) {
            if (text.length >= 3) {
              queueSearch(text);
            }
          } else {
            setItemListOpen(true);
          }
        }}
      />
      {itemListOpen && items !== undefined && (
        <div className="absolute w-full bg-white border border-slate-300 shadow-md">
          {isLoading ? (
            <div className="p1 relative">
              <Loading />
            </div>
          ) : items.length ? (
            items.map((item, i) => (
              <div
                key={i}
                className="p-1 border-b last:border-0 border-slate-300 hover:bg-slate-200"
                onClick={() => {
                  onItemSelect(item.value);
                  setItemListOpen(false);
                }}
              >
                {item.name}
              </div>
            ))
          ) : (
            <div className="p1">No results</div>
          )}
        </div>
      )}
    </div>
  );
}
