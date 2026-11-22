import { render, screen, waitFor } from "@testing-library/react";
import App from "./App";

const mockProducts = [
  { id: 1, name: "Mangoes", farmer: "Fatima Malik", farm: "River Side Farm, Multan", price: 120, quantity: 60, unit: "dozen" },
];

beforeEach(() => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockProducts),
    })
  );
});

afterEach(() => {
  jest.resetAllMocks();
});

test("renders the FarmFresh heading", () => {
  render(<App />);
  expect(screen.getByText(/Fresh From the Farm/i)).toBeInTheDocument();
});

test("loads and displays products from the API", async () => {
  render(<App />);
  await waitFor(() => {
    expect(screen.getByText("Mangoes")).toBeInTheDocument();
  });
  expect(global.fetch).toHaveBeenCalledWith(
    "/api/products",
    expect.objectContaining({ headers: expect.objectContaining({ Accept: "application/json" }) })
  );
});
