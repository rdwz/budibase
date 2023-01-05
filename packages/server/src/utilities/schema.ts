import { FieldTypes } from "../constants"

interface SchemaColumn {
  readonly name: string;
  readonly type: FieldTypes;
}

interface Schema {
  readonly [index: string]: SchemaColumn
}

interface Row {
  [index: string]: any
}

type Rows = Array<Row>

interface SchemaValidation {
  [index: string]: {
    isValid:  boolean;
    columnType: FieldTypes
  }
}

const PARSERS: any = {
  [FieldTypes.NUMBER]: (attribute?: string) => {
    if (!attribute) {
      return attribute
    }
    return Number(attribute)
  },
  [FieldTypes.DATETIME]: (attribute?: string) => {
    if (!attribute) {
      return attribute
    }
    return new Date(attribute).toISOString()
  },
}

export function isSchema(schema: any): schema is Schema {
  return typeof schema === 'object' && Object.values(schema).every(rawColumn => {
    const column = rawColumn as SchemaColumn

    return column !== null && typeof column === 'object' && typeof column.type === 'string' && Object.values(FieldTypes).includes(column.type as FieldTypes)
  })
}

export function isRows(rows: any): rows is Rows {
  return Array.isArray(rows) && rows.every(row => typeof row === 'object')
}

export function validate(rows: Rows, schema: Schema): SchemaValidation {
  const results: SchemaValidation = {}

  Object.values(schema).forEach(({ name: columnName, type: columnType }) => {
    const rowValidity = rows.map(row => {
      const columnData: any = row[columnName];

      if (columnType === FieldTypes.NUMBER) {
        // If provided must be a valid number
        return !columnData || !isNaN(Number(columnData))

      } else if (columnType === FieldTypes.DATETIME) {
        // If provided must be a valid date
        return !columnData || !isNaN(new Date(columnData).getTime())
      }

      // Any other column type accepts anything
      return true
    });

    results[columnName] = {
      isValid: rowValidity.every(rowValid => rowValid),
      columnType
    }
  });

  return results
}

export function parse(rows: Rows, schema: Schema): Rows {
  return rows.map(row => {
    const parsedRow: Row = {}

    Object.entries(row).forEach(([columnName, columnData]) => {
      const columnType = schema[columnName].type;

      if (columnType === FieldTypes.NUMBER) {
        // If provided must be a valid number
        parsedRow[columnName] = columnData ? Number(columnData) : columnData

      } else if (columnType === FieldTypes.DATETIME) {
        // If provided must be a valid date
        parsedRow[columnName] = columnData ? new Date(columnData).toISOString() : columnData
      } else {
        parsedRow[columnName] = columnData
      }
    })

    return parsedRow;
  });

  return rows
}
