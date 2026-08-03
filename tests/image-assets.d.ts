declare module "*.JPG" {
	const source: import("astro").ImageMetadata;
	export default source;
}
