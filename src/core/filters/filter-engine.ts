import { FilterGroup, FilterCondition, FilterOperator } from "@/types";
import {
  startOfDay,
  endOfDay,
  subDays,
  addDays,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfQuarter,
  endOfQuarter,
  startOfYear,
  endOfYear,
  isWithinInterval,
  parseISO,
} from "date-fns";

export function evaluateCondition(record: Record<string, any>, condition: FilterCondition): boolean {
  const { field, operator, value, valueTo } = condition;
  const fieldValue = record[field];

  if (operator === "is_set") {
    return fieldValue !== null && fieldValue !== undefined && fieldValue !== "";
  }
  if (operator === "is_not_set") {
    return fieldValue === null || fieldValue === undefined || fieldValue === "";
  }

  if (fieldValue === null || fieldValue === undefined) {
    return false;
  }

  const now = new Date();

  switch (operator) {
    // Text
    case "contains":
      return String(fieldValue).toLowerCase().includes(String(value).toLowerCase());
    case "not_contains":
      return !String(fieldValue).toLowerCase().includes(String(value).toLowerCase());
    case "equals":
      return String(fieldValue).toLowerCase() === String(value).toLowerCase();
    case "not_equals":
      return String(fieldValue).toLowerCase() !== String(value).toLowerCase();
    case "starts_with":
      return String(fieldValue).toLowerCase().startsWith(String(value).toLowerCase());
    case "ends_with":
      return String(fieldValue).toLowerCase().endsWith(String(value).toLowerCase());

    // Numbers & Currency
    case "gt":
      return Number(fieldValue) > Number(value);
    case "gte":
      return Number(fieldValue) >= Number(value);
    case "lt":
      return Number(fieldValue) < Number(value);
    case "lte":
      return Number(fieldValue) <= Number(value);
    case "between":
      return Number(fieldValue) >= Number(value) && Number(fieldValue) <= Number(valueTo);

    // Boolean
    case "is_true":
      return Boolean(fieldValue) === true;
    case "is_false":
      return Boolean(fieldValue) === false;

    // Date Presets
    case "today": {
      const d = typeof fieldValue === "string" ? parseISO(fieldValue) : new Date(fieldValue);
      return isWithinInterval(d, { start: startOfDay(now), end: endOfDay(now) });
    }
    case "yesterday": {
      const target = subDays(now, 1);
      const d = typeof fieldValue === "string" ? parseISO(fieldValue) : new Date(fieldValue);
      return isWithinInterval(d, { start: startOfDay(target), end: endOfDay(target) });
    }
    case "tomorrow": {
      const target = addDays(now, 1);
      const d = typeof fieldValue === "string" ? parseISO(fieldValue) : new Date(fieldValue);
      return isWithinInterval(d, { start: startOfDay(target), end: endOfDay(target) });
    }
    case "this_week": {
      const d = typeof fieldValue === "string" ? parseISO(fieldValue) : new Date(fieldValue);
      return isWithinInterval(d, { start: startOfWeek(now), end: endOfWeek(now) });
    }
    case "this_month": {
      const d = typeof fieldValue === "string" ? parseISO(fieldValue) : new Date(fieldValue);
      return isWithinInterval(d, { start: startOfMonth(now), end: endOfMonth(now) });
    }
    case "last_30_days": {
      const d = typeof fieldValue === "string" ? parseISO(fieldValue) : new Date(fieldValue);
      return isWithinInterval(d, { start: subDays(now, 30), end: now });
    }
    case "next_30_days": {
      const d = typeof fieldValue === "string" ? parseISO(fieldValue) : new Date(fieldValue);
      return isWithinInterval(d, { start: now, end: addDays(now, 30) });
    }
    case "date_between": {
      if (!value || !valueTo) return true;
      const d = typeof fieldValue === "string" ? parseISO(fieldValue) : new Date(fieldValue);
      const start = typeof value === "string" ? parseISO(value) : new Date(value);
      const end = typeof valueTo === "string" ? parseISO(valueTo) : new Date(valueTo);
      return isWithinInterval(d, { start: startOfDay(start), end: endOfDay(end) });
    }

    default:
      return true;
  }
}

export function evaluateFilterGroup(record: Record<string, any>, group: FilterGroup): boolean {
  if (!group || !group.conditions || group.conditions.length === 0) {
    return true;
  }

  if (group.operator === "AND") {
    return group.conditions.every((child) => {
      if ("operator" in child && ("AND" in child || "OR" in child || child.operator === "AND" || child.operator === "OR")) {
        return evaluateFilterGroup(record, child as FilterGroup);
      }
      return evaluateCondition(record, child as FilterCondition);
    });
  } else {
    // OR operator
    return group.conditions.some((child) => {
      if ("operator" in child && ("AND" in child || "OR" in child || child.operator === "AND" || child.operator === "OR")) {
        return evaluateFilterGroup(record, child as FilterGroup);
      }
      return evaluateCondition(record, child as FilterCondition);
    });
  }
}

export function filterRecords<T extends Record<string, any>>(records: T[], group?: FilterGroup | null): T[] {
  if (!group || !group.conditions || group.conditions.length === 0) {
    return records;
  }
  return records.filter((r) => evaluateFilterGroup(r, group));
}
