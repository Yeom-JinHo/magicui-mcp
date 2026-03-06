# @magicuidesign/mcp

[![npm version](https://badge.fury.io/js/@magicuidesign%2Fmcp.svg?icon=si%3Anpm)](https://badge.fury.io/js/@magicuidesign%2Fmcp)

Official ModelContextProtocol (MCP) server for [Magic UI](https://magicui.design/).

<div align="center">
  <img src="https://github.com/magicuidesign/mcp/blob/main/public/mcp.png" alt="MCP" />
</div>

## Install MCP configuration

```bash
npx @magicuidesign/cli@latest install <client>
```

### Supported Clients

- [x] cursor
- [x] windsurf
- [x] claude
- [x] cline
- [x] roo-cline

## Manual Installation

Add to your IDE's MCP config:

```json
{
  "mcpServers": {
    "magicuidesign-mcp": {
      "command": "npx",
      "args": ["-y", "@magicuidesign/mcp@latest"]
    }
  }
}
```

## Example Usage

Once configured, you can ask questions like:

> "Find a marquee component for a logo wall"

> "Search for background components"

> "Show me the details for marquee, including install instructions and examples"

## Available Tools

The server provides the following tools callable via MCP:

| Tool Name | Description |
|---|---|
| `listRegistryItems` | Lists registry items with optional filters like `kind`, `query`, and `limit`. |
| `searchRegistryItems` | Searches registry items by keyword or use case and returns ranked matches. |
| `getRegistryItem` | Returns details for a single item, including install instructions and optional source, related items, and examples. |

## MCP Limitations

Some clients have a [limit](https://docs.cursor.com/context/model-context-protocol#limitations) on the number of tools they can call. This server keeps the tool surface small on purpose and pushes discovery into queryable tools instead of hardcoded category-specific tools.

## Credits

Big thanks to [@beaubhp](https://github.com/beaubhp) for creating the MCP server 🙏

[MIT](https://github.com/magicuidesign/mcp/blob/main/LICENSE.md)
