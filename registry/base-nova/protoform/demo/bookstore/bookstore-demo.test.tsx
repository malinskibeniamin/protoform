import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { BookstoreDemo } from "./bookstore-demo";

function renderDemo() {
  render(<BookstoreDemo visitorId="bookstore-demo-test" />);
}

describe("bookstore flagship demo", () => {
  it("lists, gets, and creates a book through a CEL-validated RHF stepper", async () => {
    const user = userEvent.setup();
    renderDemo();

    await user.click(
      await screen.findByRole("button", {
        name: "Designing Data-Intensive Applications",
      })
    );
    expect(
      await screen.findByRole("heading", {
        name: "Designing Data-Intensive Applications",
      })
    ).toBeVisible();
    expect(screen.getByText("9781449373320")).toBeVisible();

    await user.click(screen.getByRole("button", { name: "Back to books" }));
    await user.click(screen.getByRole("button", { name: "Create book" }));
    const title = screen.getByRole("textbox", { name: "Title" });
    const isbn = screen.getByRole("textbox", { name: "ISBN-13" });
    expect(isbn).toHaveAccessibleDescription(
      "Thirteen digits. The check digit is verified by the CEL rule in the proto."
    );
    await user.type(title, "Protocol");
    await user.type(
      isbn,
      "9783161484101"
    );
    await user.click(screen.getByRole("button", { name: "Continue" }));
    expect(
      await screen.findByText("ISBN must have a valid ISBN-13 check digit.")
    ).toBeVisible();
    expect(isbn).toHaveAttribute("aria-invalid", "true");

    await user.clear(isbn);
    await user.type(isbn, "9783161484100");
    await user.click(screen.getByRole("button", { name: "Continue" }));
    const bookId = screen.getByRole("textbox", { name: "Book id" });
    expect(bookId).toHaveAttribute(
      "pattern",
      String.raw`[a-z][a-z0-9\-]{2,62}[a-z0-9]`
    );
    await user.type(
      bookId,
      "protocol-design"
    );
    await user.type(
      screen.getByRole("textbox", { name: "Note" }),
      "Created through the generated binding."
    );
    await user.click(screen.getByRole("button", { name: "Create book" }));

    expect(
      await screen.findByRole("heading", { name: "Protocol" })
    ).toBeVisible();
  });

  it("updates with an etag and field mask, then deletes with AutoForm", async () => {
    const user = userEvent.setup();
    renderDemo();

    await user.click(
      await screen.findByRole("button", { name: "Domain-Driven Design" })
    );
    await user.click(screen.getByRole("button", { name: "Edit book" }));
    const title = screen.getByRole("textbox", { name: "Title" });
    await user.clear(title);
    await user.click(screen.getByRole("button", { name: "Save changes" }));
    expect(title).toHaveAttribute("aria-invalid", "true");

    await user.type(title, "Domain Modeling");
    await user.click(screen.getByRole("button", { name: "Save changes" }));
    expect(
      await screen.findByRole("heading", { name: "Domain Modeling" })
    ).toBeVisible();

    await user.click(screen.getByRole("button", { name: "Delete book" }));
    await user.click(screen.getByRole("button", { name: "Delete book" }));
    expect(
      await screen.findByRole("heading", { name: "Books" })
    ).toBeVisible();
    expect(
      screen.queryByRole("button", { name: "Domain Modeling" })
    ).not.toBeInTheDocument();
  });
});
