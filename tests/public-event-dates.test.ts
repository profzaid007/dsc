import { test } from "node:test"
import assert from "node:assert/strict"
import { publicEventDate, publicEventDateLabel, publicEventDay, publicEventInstant } from "../lib/public-event-dates"
import { dayKey } from "../lib/event-dates"

test("SSR and first hydration interpret naive wall-clock dates consistently", () => {
  assert.equal(publicEventDate("2027-01-02T18:30:00", false).toISOString(), "2027-01-02T18:30:00.000Z")
  assert.equal(publicEventDate("2027-01-02", false, true).toISOString(), "2027-01-02T23:59:59.999Z")
  assert.equal(publicEventDate("2027-01-02T18:30:00+03:00", false).toISOString(), "2027-01-02T15:30:00.000Z")
})
test("SSR date labels and calendar keys are timezone independent near midnight", () => {
  const date = new Date("2027-01-02T23:30:00Z")
  assert.equal(publicEventDay(date, false), "2027-01-02")
  assert.equal(publicEventDateLabel("2027-01-02T23:30:00Z", false), "02-01-2027")
  assert.equal(publicEventDateLabel("2027-01-02", false), "02-01-2027")
  assert.equal(publicEventDay(date, true), dayKey(date))
  assert.equal(publicEventDateLabel("invalid", false), "")
  assert.equal(publicEventDay(new Date("invalid"), false), "")
})

test("enrolment and status checks retain the existing date-only deadline instant", () => {
  for (const hydrated of [false, true]) assert.equal(publicEventInstant("2027-01-02", hydrated).toISOString(), "2027-01-02T00:00:00.000Z")
})
