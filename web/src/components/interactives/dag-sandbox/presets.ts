import type { Dag } from './engine'
import type { EdgeCoefs } from './sim'

export interface DagPreset {
  id: string
  name: string
  dag: Dag
  /** the causal question the preset poses */
  exposure: string
  outcome: string
  blurb: string
  /** node positions for the sandbox, unit square */
  layout: Record<string, [number, number]>
  /** structural coefficients for the simulator (unlisted edges are 1) */
  coefs?: EdgeCoefs
}

export const presets: DagPreset[] = [
  {
    id: 'fork',
    name: 'The fork',
    dag: { nodes: ['X', 'Y', 'Z'], edges: [['Z', 'X'], ['Z', 'Y']] },
    exposure: 'X',
    outcome: 'Y',
    blurb: 'A common cause. X and Y dance together with no arrow between them.',
    layout: { X: [0.15, 0.75], Z: [0.5, 0.2], Y: [0.85, 0.75] },
  },
  {
    id: 'pipe',
    name: 'The pipe',
    dag: { nodes: ['X', 'Z', 'Y'], edges: [['X', 'Z'], ['Z', 'Y']] },
    exposure: 'X',
    outcome: 'Y',
    blurb: 'A chain. Condition on the middle and the message never arrives.',
    layout: { X: [0.15, 0.5], Z: [0.5, 0.5], Y: [0.85, 0.5] },
  },
  {
    id: 'collider',
    name: 'The collider',
    dag: {
      nodes: ['X', 'Z', 'Y', 'D'],
      edges: [['X', 'Z'], ['Y', 'Z'], ['Z', 'D']],
    },
    exposure: 'X',
    outcome: 'Y',
    blurb: 'Two arrows meet. Independent until you condition on the meeting point — or anything downstream of it.',
    layout: { X: [0.15, 0.25], Y: [0.85, 0.25], Z: [0.5, 0.6], D: [0.5, 0.9] },
  },
  {
    id: 'waffles',
    name: 'Waffle divorce',
    dag: {
      nodes: ['S', 'W', 'A', 'M', 'D'],
      edges: [
        ['S', 'W'],
        ['S', 'A'],
        ['S', 'M'],
        ['A', 'M'],
        ['A', 'D'],
        ['M', 'D'],
        ['W', 'D'],
      ],
    },
    exposure: 'W',
    outcome: 'D',
    blurb:
      'Waffle Houses per capita predict divorce. Southernness pulls every string. What must you close to test W → D honestly?',
    layout: { S: [0.5, 0.1], W: [0.12, 0.45], A: [0.5, 0.45], M: [0.82, 0.55], D: [0.42, 0.9] },
    // Waffle Houses do not cause divorce; the simulator makes the lie visible.
    coefs: { 'W->D': 0 },
  },
  {
    id: 'milk',
    name: 'Primate milk',
    dag: {
      nodes: ['M', 'N', 'K'],
      edges: [['M', 'N'], ['M', 'K'], ['N', 'K']],
    },
    exposure: 'N',
    outcome: 'K',
    blurb:
      'Neocortex and body mass mask each other in milk energy. Alone, each looks like nothing; together, both speak.',
    layout: { M: [0.5, 0.15], N: [0.15, 0.75], K: [0.85, 0.75] },
  },
  {
    id: 'fungus',
    name: 'Plant fungus',
    dag: {
      nodes: ['H0', 'T', 'F', 'H1'],
      edges: [['H0', 'H1'], ['T', 'F'], ['F', 'H1']],
    },
    exposure: 'T',
    outcome: 'H1',
    blurb:
      'Treatment kills fungus; fungus stunts growth. Condition on fungus and the treatment effect vanishes — post-treatment bias.',
    layout: { H0: [0.15, 0.2], T: [0.85, 0.2], F: [0.85, 0.65], H1: [0.35, 0.8] },
    // treatment suppresses fungus, fungus suppresses growth: total effect +1
    coefs: { 'T->F': -1, 'F->H1': -1 },
  },
  {
    id: 'grandparents',
    name: 'Grandparents',
    dag: {
      nodes: ['G', 'P', 'C', 'U'],
      edges: [['G', 'P'], ['G', 'C'], ['P', 'C'], ['U', 'P'], ['U', 'C']],
      unobserved: ['U'],
    },
    exposure: 'G',
    outcome: 'C',
    blurb:
      'Unseen neighborhoods U shape parents and children. Condition on P and you open a haunted road from G to C through U.',
    layout: { G: [0.15, 0.2], P: [0.15, 0.7], C: [0.6, 0.9], U: [0.85, 0.35] },
  },
]

export function presetById(id: string): DagPreset | undefined {
  return presets.find((p) => p.id === id)
}
