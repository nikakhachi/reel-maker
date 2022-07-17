export const downloadFromLinks = async (links: string[]) => {
  for (const url of links) {
    const link = document.createElement("a");
    link.id = "download-link-" + url;
    link.href = url;
    link.click();
    link.remove();
    await new Promise((res, rej) => setTimeout(() => res(""), 1000));
  }
};
