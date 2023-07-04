import * as color2k from "color2k";

function isVariableAlias(value: any): value is VariableAlias {
  if (!value) {
    return false;
  }
  if ("type" in value === false) {
    return false;
  }
  return value.type === "VARIABLE_ALIAS";
}

export async function printVariablesFormatted() {
  const variables = figma.variables.getLocalVariables();
  const variableMap = new Map<string, Variable>(
    variables.map((v) => [v.name, v])
  );

  function getVariable(name: string) {
    const variable = variableMap.get(name);

    if (!variable) {
      throw new Error(`Variable ${name} not found`);
    }

    return variable;
  }

  function evaluateVariable(variable: Variable, modeId: string): VariableValue {
    const value = variable.valuesByMode[modeId];
    console.log(variable.valuesByMode);
    console.log(variable.name, value);
    if (isVariableAlias(value)) {
      const boundVariable = figma.variables.getVariableById(value.id)!;
      console.log("bound", variable.name, boundVariable);
      return evaluateVariable(boundVariable, modeId);
    }
    return value;
  }

  function getBoundedName(variable: Variable, modeId: string): string | null {
    const value = variable.valuesByMode[modeId];

    if (isVariableAlias(value)) {
      const boundVariable = figma.variables.getVariableById(value.id)!;
      return boundVariable.name;
    }
    return null;
  }

  const textNodesToRender = figma.currentPage.findAll(
    (node) => node.type === "TEXT" && node.name.startsWith("%printf")
  ) as TextNode[];

  let printedCount = 0;
  for (const node of textNodesToRender) {
    const name = node.name;
    const matched = name.match(/%printf\("(.*)", (.*)\)/);

    if (matched !== null) {
      const [fstring, variableName] = [matched[1], matched[2]].map((s) =>
        s.trim()
      );

      const variable = getVariable(variableName);
      const collection = figma.variables.getVariableCollectionById(
        variable.variableCollectionId
      )!;
      const modeId = node.resolvedVariableModes[collection.id];
      const evaluated = evaluateVariable(variable, modeId) as RGBA;
      const boundedName = getBoundedName(variable, modeId);

      const [r, g, b, a] = [
        evaluated.r * 255,
        evaluated.g * 255,
        evaluated.b * 255,
        evaluated.a,
      ];
      const rgba = color2k.rgba(r, g, b, a);
      const hex = color2k.toHex(rgba);
      const resultString = fstring
        .replaceAll("%hex", hex)
        .replaceAll("%rgba", rgba)
        .replaceAll("%bound", boundedName || "N/A")
        .replaceAll("%r", r.toString())
        .replaceAll("%g", g.toString())
        .replaceAll("%b", b.toString())
        .replaceAll("%a", a.toString());

      await figma.loadFontAsync(node.fontName as FontName);
      node.characters = resultString;

      printedCount += 1;
    }
  }

  figma.notify(`Printed ${printedCount} variables`);
}
