export function getLocalStorageItem(itemName: string = "stats_debug"): boolean {
  const data = localStorage.getItem(itemName);
  if (data === null) {
    localStorage.setItem(itemName, "0");
  }
  return data === "1";
}
