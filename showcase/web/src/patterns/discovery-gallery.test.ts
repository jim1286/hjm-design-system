import { expect, it } from "vitest";
import { galleryEntries, selectGalleryEntries } from "../../../shared/discovery-gallery";
it("intersects query, category and collection while preserving immutable fixture order", () => {
 const order=galleryEntries.map(item=>item.id);
 expect(selectGalleryEntries("모바일", "전체", "popular", false, []).map(item=>item.id)).toEqual(["garden","travel"]);
 expect(selectGalleryEntries("서연", "대시보드", "latest", true, ["garden"])).toEqual([]);
 expect(selectGalleryEntries("서연", "대시보드", "latest", true, ["focus"])[0]?.id).toBe("focus");
 expect(selectGalleryEntries("", "전체", "latest", false, [])[0]?.id).toBe("garden");
 expect(selectGalleryEntries("", "전체", "popular", false, [])[0]?.id).toBe("week");
 expect(galleryEntries.map(item=>item.id)).toEqual(order);
});
