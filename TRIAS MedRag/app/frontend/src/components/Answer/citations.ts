export function formatCitationForDisplay(citation: string): string {
    if (!citation) return "";

    // Split by hash to separate filename and page
    const [filename, pageHash] = citation.split("#");

    // Special case handling: map copd.pdf to its original name
    let processedFilename = filename;
    if (filename.toLowerCase().includes("copd.pdf")) {
        processedFilename = "nvl-003l_S3_COPD_2024-12.pdf";
    }

    // Extract base filename without path and initial numbers/special chars
    const cleanName = processedFilename
        .split("/")
        .pop()
        ?.replace(/^\d+-\d+[a-z]?_/, "")
        ?.replace(/^nvl-\d+[a-z]?_?/, "");

    // Get page number if it exists
    const pageNum = pageHash?.replace("page=", "") || "1";

    // Remove file extension
    const nameWithoutExt = cleanName?.replace(/\.[^/.]+$/, "");

    // Replace underscores with spaces and construct final format
    return `${nameWithoutExt?.replace(/_/g, " ")} Seite ${pageNum}`;
}
