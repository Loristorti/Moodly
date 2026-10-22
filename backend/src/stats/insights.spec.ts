import { MoodTag } from '../generated/prisma/client.js';
import { AlertInput, buildAlerts } from './insights.js';

const calm: AlertInput = {
  average: 3.5,
  previousAverage: 3.5,
  participationRate: 0.8,
  lowAnswerTags: [],
  threshold: 3,
};

const lowAnswers = (...answers: MoodTag[][]) => answers;

describe('buildAlerts', () => {
  it('returns no alert when nothing changes', () => {
    expect(buildAlerts(calm)).toEqual([]);
  });

  it('points out a decline of at least 0.3', () => {
    expect(
      buildAlerts({ ...calm, average: 3.1, previousAverage: 3.4 }),
    ).toEqual([{ type: 'DECLINE', value: -0.3 }]);
    expect(
      buildAlerts({ ...calm, average: 3.2, previousAverage: 3.4 }),
    ).toEqual([]);
  });

  it('points out an improvement of at least 0.3', () => {
    expect(
      buildAlerts({ ...calm, average: 3.9, previousAverage: 3.5 }),
    ).toEqual([{ type: 'IMPROVEMENT', value: 0.4 }]);
  });

  it('gives no trend when one of the periods is hidden', () => {
    expect(buildAlerts({ ...calm, previousAverage: null })).toEqual([]);
    expect(buildAlerts({ ...calm, average: null })).toEqual([]);
  });

  it('points out a theme cited in at least 40 % of the low answers', () => {
    const alerts = buildAlerts({
      ...calm,
      lowAnswerTags: lowAnswers(
        ['WORKLOAD'],
        ['WORKLOAD', 'MANAGEMENT'],
        ['RECOGNITION'],
        [],
      ),
    });
    expect(alerts).toEqual([{ type: 'CONCERN', tag: 'WORKLOAD', value: 0.5 }]);
  });

  it('gives no concern below 40 %', () => {
    const alerts = buildAlerts({
      ...calm,
      lowAnswerTags: lowAnswers(['WORKLOAD'], ['MANAGEMENT'], ['RECOGNITION']),
    });
    expect(alerts).toEqual([]);
  });

  it('never describes fewer low answers than the anonymity threshold', () => {
    const alerts = buildAlerts({
      ...calm,
      lowAnswerTags: lowAnswers(['WORKLOAD'], ['WORKLOAD']),
    });
    expect(alerts).toEqual([]);
  });

  it('points out a participation under 50 %', () => {
    expect(buildAlerts({ ...calm, participationRate: 0.42 })).toEqual([
      { type: 'LOW_PARTICIPATION', value: 0.42 },
    ]);
  });

  it('puts the most urgent first and keeps at most 3 alerts', () => {
    const alerts = buildAlerts({
      average: 2.8,
      previousAverage: 3.6,
      participationRate: 0.3,
      lowAnswerTags: lowAnswers(['WORKLOAD'], ['WORKLOAD'], ['WORKLOAD']),
      threshold: 3,
    });
    expect(alerts.map((alert) => alert.type)).toEqual([
      'DECLINE',
      'CONCERN',
      'LOW_PARTICIPATION',
    ]);
  });
});
