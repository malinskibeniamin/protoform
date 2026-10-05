import { describe, expect, test } from "@rstest/core";
import { render, screen } from "@testing-library/react";

import { Tabs, TabsList, TabsTrigger } from "./index";

function Example({ columns }: { columns: number }) {
  return (
    <Tabs defaultValue="first">
      <TabsList aria-label="Sections" columns={columns} layout="equal">
        <TabsTrigger value="first">First</TabsTrigger>
        <TabsTrigger value="second">Second</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}

describe("TabsList equal layout", () => {
  test("applies the requested column count and updates it", () => {
    const { rerender } = render(<Example columns={2} />);

    expect(screen.getByRole("tablist", { name: "Sections" })).toHaveStyle({
      "--tabs-columns": "2",
    });

    rerender(<Example columns={3} />);

    expect(screen.getByRole("tablist", { name: "Sections" })).toHaveStyle({
      "--tabs-columns": "3",
    });
  });
});
