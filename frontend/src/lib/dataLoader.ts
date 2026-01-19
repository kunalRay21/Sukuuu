// Data loading utilities

export async function loadYearData(year: number) {
  try {
    const response = await fetch(`/data/data_${year}.json`);
    if (!response.ok) throw new Error("Data not found");
    return await response.json();
  } catch (error) {
    console.error(`Failed to load data for ${year}:`, error);
    return null;
  }
}

export async function loadAllData() {
  try {
    const response = await fetch("/data/all_messages.json");
    if (!response.ok) throw new Error("Data not found");
    return await response.json();
  } catch (error) {
    console.error("Failed to load all messages:", error);
    return null;
  }
}

export async function loadSummaryStats() {
  try {
    const response = await fetch("/data/summary_stats.json");
    if (!response.ok) throw new Error("Stats not found");
    return await response.json();
  } catch (error) {
    console.error("Failed to load summary stats:", error);
    return null;
  }
}

export async function loadAnnotations() {
  try {
    const response = await fetch("/annotations.json");
    if (!response.ok) throw new Error("Annotations not found");
    return await response.json();
  } catch (error) {
    console.error("Failed to load annotations:", error);
    return [];
  }
}
