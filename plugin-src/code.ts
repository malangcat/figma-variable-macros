import { calculateVariables } from "./calculate";
import { printVariablesFormatted } from "./print";

figma.showUI(__html__, { themeColors: true, height: 300 });

figma.ui.onmessage = async (msg) => {
  try {
    if (msg.type === "calculate-variables") {
      calculateVariables();
      return;
    }
    if (msg.type === "render-variables") {
      await printVariablesFormatted();
      return;
    }
  } catch (err: any) {
    figma.notify(err.message, {
      error: true,
    });
  }
};
