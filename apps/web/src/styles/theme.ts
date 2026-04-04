import { createTheme, type MantineColorsTuple } from "@mantine/core";

const voltazeBlue: MantineColorsTuple = [
	"#e6f4ff",
	"#cce5ff",
	"#99cbff",
	"#66b0ff",
	"#3399ff",
	"#0088ff",
	"#0077e6",
	"#0066cc",
	"#0055b3",
	"#004499",
];

const voltazePurple: MantineColorsTuple = [
	"#f3e5ff",
	"#e4ccff",
	"#c999ff",
	"#ad66ff",
	"#9333ff",
	"#7a00ff",
	"#6b00e6",
	"#5c00cc",
	"#4d00b3",
	"#3e0099",
];

export const theme = createTheme({
	primaryColor: "voltazeBlue",
	colors: {
		voltazeBlue,
		voltazePurple,
	},
	fontFamily:
		"var(--font-geist-sans), -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
	headings: {
		fontFamily:
			"var(--font-geist-sans), -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
	},
	defaultRadius: "md",
	components: {
		Button: {
			defaultProps: {
				radius: "md",
			},
		},
		Card: {
			defaultProps: {
				radius: "md",
				shadow: "sm",
			},
		},
		Modal: {
			defaultProps: {
				radius: "md",
			},
		},
		Paper: {
			defaultProps: {
				radius: "md",
			},
		},
	},
});
