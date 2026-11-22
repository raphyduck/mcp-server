import { describe, it, expect } from '@jest/globals';
import { ListToolsResultSchema } from '@modelcontextprotocol/sdk/types.js';
import { cliTools, organizationApiTools } from '../src/tools/index.js';

const CONNECTOR_KEY = 'hobbitton.at/connecteur';
const ACTS_KEY = 'hobbitton.at/agit';

describe('Tool connector declarations', () => {
  // What the server answers to `tools/list` (the ListToolsRequestSchema handler
  // in src/index.ts), read through the SDK's own schema as an MCP client does.
  const { tools } = ListToolsResultSchema.parse({
    tools: [...cliTools, ...organizationApiTools],
  });

  it('should publish tools', () => {
    expect(tools.length).toBeGreaterThan(0);
  });

  it('should declare a connector (a name or null) on every published tool', () => {
    const undeclared = tools
      .filter((tool) => {
        const meta = tool._meta;
        if (!meta || !Object.hasOwn(meta, CONNECTOR_KEY)) {
          return true;
        }
        const connector = meta[CONNECTOR_KEY];
        return (
          connector !== null &&
          (typeof connector !== 'string' || connector === '')
        );
      })
      .map((tool) => tool.name);

    expect(undeclared).toEqual([]);
  });

  it('should say whether every published tool acts, a closed tool always', () => {
    const wrong = tools
      .filter((tool) => {
        const acts = tool._meta?.[ACTS_KEY];
        return (
          typeof acts !== 'boolean' ||
          (tool._meta?.[CONNECTOR_KEY] === null && !acts)
        );
      })
      .map((tool) => tool.name);

    expect(wrong).toEqual([]);
  });
});
