import { LockAndKeyGameConfig } from "../types";

const lockAndKeyPain: LockAndKeyGameConfig = {
  id: "lock-and-key-pain",
  gameMode: "lock-and-key",
  title: "LOCK & KEY",
  subtitle: "CPT-ICD Pairing Challenge",
  password: "pain123",
  categories: [
    { name: "Epidural Injections", shortName: "Epidurals" },
    { name: "Facet Joint (MBB + RFA)", shortName: "Facet" },
    { name: "Peripheral Nerve", shortName: "Periph Nerve" },
    { name: "Joint Injections / Denervation", shortName: "Joints/Denerv" },
    { name: "Neuromodulation (SCS + PNS)", shortName: "Neuromod" },
    { name: "Botox / MIS / Other", shortName: "Botox/MIS" },
  ],
  rounds: [
    // ========== Epidural Injections (4 rounds) ==========
    // Round 1: CPT 62321 — ILESI C/T (Difficulty 1)
    {
      id: "lk-epi-1",
      cptCode: "62321",
      cptDescription: "Interlaminar epidural steroid injection, cervical or thoracic",
      category: "Epidural Injections",
      subcategory: "ILESI C/T",
      scenario:
        "A 52-year-old office worker presents with 3 months of neck pain radiating into the right arm along the C6 dermatome. MRI shows a C5-6 disc protrusion with moderate foraminal stenosis. Conservative therapy including physical therapy and oral NSAIDs has failed to provide relief.",
      options: [
        {
          code: "M54.13",
          description: "Radiculopathy, cervicothoracic region",
          isCorrect: true,
        },
        {
          code: "M54.17",
          description: "Radiculopathy, lumbosacral region",
          isCorrect: true,
        },
        {
          code: "M99.31",
          description: "Osseous stenosis of neural canal, cervical region",
          isCorrect: true,
        },
        {
          code: "G89.3",
          description: "Neoplasm related pain (acute)(chronic)",
          isCorrect: true,
        },
        {
          code: "M54.2",
          description: "Cervicalgia",
          isCorrect: false,
          explanation:
            "Too nonspecific — cervicalgia is simple neck pain without radicular component, which does not support epidural injection.",
        },
        {
          code: "M47.812",
          description: "Spondylosis with myelopathy, cervical",
          isCorrect: false,
          explanation:
            "Myelopathy codes are not on the approved list for interlaminar epidural injections. Myelopathy may require surgical rather than interventional management.",
        },
        {
          code: "G89.29",
          description: "Other chronic pain",
          isCorrect: false,
          explanation:
            "Too nonspecific — payers require a specific anatomical diagnosis to justify an epidural injection, not a generic chronic pain code.",
        },
      ],
      revealNote:
        "ILESI C/T (62321) requires a cervicothoracic radiculopathy or stenosis diagnosis. Generic neck pain codes like M54.2 (cervicalgia) will not meet medical necessity for an epidural.",
      difficulty: 1,
    },

    // Round 2: CPT 62323 — ILESI L/S (Difficulty 2)
    {
      id: "lk-epi-2",
      cptCode: "62323",
      cptDescription: "Interlaminar epidural steroid injection, lumbar or sacral",
      category: "Epidural Injections",
      subcategory: "ILESI L/S",
      scenario:
        "A 64-year-old retired teacher has progressive bilateral lower extremity pain and numbness worsening over 6 months. She can only walk one block before needing to sit. MRI reveals moderate central canal stenosis at L3-4 and L4-5 with ligamentum flavum hypertrophy.",
      options: [
        {
          code: "M54.17",
          description: "Radiculopathy, lumbosacral region",
          isCorrect: true,
        },
        {
          code: "M99.33",
          description: "Osseous stenosis of neural canal, lumbar region",
          isCorrect: true,
        },
        {
          code: "M48.062",
          description: "Spinal stenosis, lumbar with neurogenic claudication",
          isCorrect: true,
        },
        {
          code: "G89.3",
          description: "Neoplasm related pain (acute)(chronic)",
          isCorrect: true,
        },
        {
          code: "M54.5",
          description: "Low back pain",
          isCorrect: false,
          explanation:
            "Too nonspecific — low back pain alone does not establish medical necessity for an epidural injection. A specific radiculopathy or stenosis diagnosis is required.",
        },
        {
          code: "M54.41",
          description: "Lumbago with sciatica, right side",
          isCorrect: false,
          explanation:
            "While this code describes radicular symptoms, it is not on Stanford's approved pairing list for 62323. Use radiculopathy (M54.17) or stenosis codes instead.",
        },
        {
          code: "M51.16",
          description: "IVD disorder with radiculopathy, lumbar",
          isCorrect: false,
          explanation:
            "Disc-specific radiculopathy code — not on the approved pairing list for interlaminar epidurals at Stanford. Use M54.17 for lumbosacral radiculopathy.",
        },
      ],
      revealNote:
        "ILESI L/S (62323) pairs with lumbosacral radiculopathy (M54.17), lumbar stenosis codes (M99.33, M48.062), and neoplasm-related pain (G89.3). Avoid nonspecific low back pain codes.",
      difficulty: 2,
    },

    // Round 3: CPT 64479 — TFESI C/T 1st (Difficulty 2)
    {
      id: "lk-epi-3",
      cptCode: "64479",
      cptDescription:
        "Transforaminal epidural steroid injection, cervical or thoracic, first level",
      category: "Epidural Injections",
      subcategory: "TFESI C/T 1st",
      scenario:
        "A 45-year-old construction worker develops acute right-sided neck and shoulder pain after a lifting injury. EMG confirms C7 radiculopathy. He has failed 6 weeks of physical therapy and gabapentin. The interventionalist plans a targeted C7 transforaminal approach.",
      options: [
        {
          code: "M54.13",
          description: "Radiculopathy, cervicothoracic region",
          isCorrect: true,
        },
        {
          code: "M99.31",
          description: "Osseous stenosis of neural canal, cervical region",
          isCorrect: true,
        },
        {
          code: "M99.33",
          description: "Osseous stenosis of neural canal, lumbar region",
          isCorrect: true,
        },
        {
          code: "M48.062",
          description: "Spinal stenosis, lumbar with neurogenic claudication",
          isCorrect: true,
        },
        {
          code: "M54.2",
          description: "Cervicalgia",
          isCorrect: false,
          explanation:
            "Too nonspecific — simple neck pain without radiculopathy or stenosis does not justify a transforaminal epidural injection.",
        },
        {
          code: "G89.29",
          description: "Other chronic pain",
          isCorrect: false,
          explanation:
            "Too nonspecific — a generic chronic pain code does not meet medical necessity criteria for a transforaminal epidural.",
        },
        {
          code: "M47.812",
          description: "Spondylosis with myelopathy, cervical",
          isCorrect: false,
          explanation:
            "Myelopathy is not an approved indication for transforaminal epidurals. Myelopathy suggests spinal cord compression requiring surgical evaluation.",
        },
      ],
      revealNote:
        "TFESI C/T (64479) shares the same approved ICD-10 codes as ILESI. The key differentiator is the approach — transforaminal delivers medication directly at the neural foramen for more targeted relief.",
      difficulty: 2,
    },

    // Round 4: CPT 64483 — TFESI L/S 1st (Difficulty 3)
    {
      id: "lk-epi-4",
      cptCode: "64483",
      cptDescription:
        "Transforaminal epidural steroid injection, lumbar or sacral, first level",
      category: "Epidural Injections",
      subcategory: "TFESI L/S 1st",
      scenario:
        "A 58-year-old nurse with a history of L4-5 laminectomy 5 years ago now presents with recurrent left L5 radiculopathy. MRI shows post-surgical scarring and a small recurrent disc herniation at L4-5. She failed physical therapy and a prior interlaminar ESI provided only 2 weeks of relief.",
      options: [
        {
          code: "M54.17",
          description: "Radiculopathy, lumbosacral region",
          isCorrect: true,
        },
        {
          code: "M99.33",
          description: "Osseous stenosis of neural canal, lumbar region",
          isCorrect: true,
        },
        {
          code: "M48.062",
          description: "Spinal stenosis, lumbar with neurogenic claudication",
          isCorrect: true,
        },
        {
          code: "G89.3",
          description: "Neoplasm related pain (acute)(chronic)",
          isCorrect: true,
        },
        {
          code: "M54.5",
          description: "Low back pain",
          isCorrect: false,
          explanation:
            "Too nonspecific — low back pain without radicular component does not support transforaminal epidural injection. Must document radiculopathy or stenosis.",
        },
        {
          code: "M54.42",
          description: "Lumbago with sciatica, left side",
          isCorrect: false,
          explanation:
            "Although this describes sciatica, it is not on the approved pairing list for TFESI L/S. Use the specific radiculopathy code M54.17 instead.",
        },
        {
          code: "M51.06",
          description: "IVD disorder with myelopathy, lumbar",
          isCorrect: false,
          explanation:
            "Myelopathy codes are not approved for transforaminal epidural injections. Lumbar myelopathy (conus medullaris syndrome) typically requires surgical evaluation.",
        },
        {
          code: "M54.13",
          description: "Radiculopathy, cervicothoracic region",
          isCorrect: false,
          explanation:
            "Wrong body region — cervicothoracic radiculopathy is approved for C/T epidurals (62321, 64479), not for lumbar/sacral transforaminal injections.",
        },
      ],
      revealNote:
        "TFESI L/S (64483) has a slightly narrower approved ICD-10 list than ILESI L/S. Note that M54.13 (cervicothoracic radiculopathy) is NOT approved for the lumbar approach — body region must match the injection site.",
      difficulty: 3,
    },

    // ========== Facet Joint (MBB + RFA) (4 rounds) ==========
    // Round 5: CPT 64490 — MBB C/T 1st (Difficulty 1)
    {
      id: "lk-facet-1",
      cptCode: "64490",
      cptDescription:
        "Medial branch block, cervical or thoracic, first level",
      category: "Facet Joint (MBB + RFA)",
      subcategory: "MBB C/T 1st",
      scenario:
        "A 48-year-old accountant presents with 4 months of axial neck pain that worsens with extension and rotation. Pain is localized to the paraspinal region without upper extremity radiculopathy. Physical exam shows tenderness over the C4-5 facet joints bilaterally. MRI shows facet hypertrophy at C4-5 and C5-6.",
      options: [
        {
          code: "M47.892",
          description: "Other spondylosis, cervical region",
          isCorrect: true,
        },
        {
          code: "M47.894",
          description: "Other spondylosis, thoracic region",
          isCorrect: true,
        },
        {
          code: "M54.2",
          description: "Cervicalgia",
          isCorrect: false,
          explanation:
            "Too nonspecific — simple neck pain does not establish the facet-mediated etiology required for medial branch blocks. Must document spondylosis.",
        },
        {
          code: "M54.13",
          description: "Radiculopathy, cervicothoracic region",
          isCorrect: false,
          explanation:
            "Radiculopathy indicates nerve root pathology, which is treated with epidural injections, not facet-mediated procedures like medial branch blocks.",
        },
        {
          code: "M47.812",
          description: "Spondylosis with myelopathy, cervical",
          isCorrect: false,
          explanation:
            "Myelopathy codes are not approved for MBB. Spondylosis with myelopathy suggests cord compression requiring surgical evaluation, not facet procedures.",
        },
        {
          code: "M47.896",
          description: "Other spondylosis, lumbar region",
          isCorrect: false,
          explanation:
            "Wrong body region — lumbar spondylosis pairs with lumbar MBB (64493), not cervical/thoracic MBB (64490).",
        },
        {
          code: "G89.29",
          description: "Other chronic pain",
          isCorrect: false,
          explanation:
            "Too nonspecific — a generic chronic pain code does not support the medical necessity for a diagnostic medial branch block.",
        },
      ],
      revealNote:
        "Cervical/thoracic MBB (64490) requires spondylosis codes (M47.892 or M47.894). This is a diagnostic procedure — two positive blocks (>80% relief) are typically required before proceeding to radiofrequency ablation.",
      difficulty: 1,
    },

    // Round 6: CPT 64493 — MBB L/S 1st (Difficulty 2)
    {
      id: "lk-facet-2",
      cptCode: "64493",
      cptDescription: "Medial branch block, lumbar or sacral, first level",
      category: "Facet Joint (MBB + RFA)",
      subcategory: "MBB L/S 1st",
      scenario:
        "A 55-year-old warehouse manager presents with chronic axial low back pain for over 1 year, worse with prolonged standing and extension maneuvers. There is no radicular component. Physical examination reveals paraspinal tenderness at L4-5 and L5-S1. MRI demonstrates facet arthropathy at these levels without significant disc pathology.",
      options: [
        {
          code: "M47.896",
          description: "Other spondylosis, lumbar region",
          isCorrect: true,
        },
        {
          code: "M47.897",
          description: "Other spondylosis, lumbosacral region",
          isCorrect: true,
        },
        {
          code: "M54.5",
          description: "Low back pain",
          isCorrect: false,
          explanation:
            "Too nonspecific — low back pain alone does not establish the facet joint etiology required for medial branch block authorization.",
        },
        {
          code: "M47.816",
          description: "Spondylosis with myelopathy, lumbar",
          isCorrect: false,
          explanation:
            "Myelopathy codes are not approved for MBB. Lumbar myelopathy suggests conus medullaris pathology requiring different workup.",
        },
        {
          code: "M47.892",
          description: "Other spondylosis, cervical region",
          isCorrect: false,
          explanation:
            "Wrong body region — cervical spondylosis pairs with cervical MBB (64490), not lumbar MBB (64493).",
        },
        {
          code: "M54.41",
          description: "Lumbago with sciatica, right side",
          isCorrect: false,
          explanation:
            "Sciatica implies radicular pain, which is not the indication for facet-mediated procedures. Radicular symptoms are treated with epidural injections.",
        },
        {
          code: "M79.1",
          description: "Myalgia",
          isCorrect: false,
          explanation:
            "Wrong diagnosis type — myalgia is a muscular pain diagnosis and does not support facet joint interventions.",
        },
      ],
      revealNote:
        "Lumbar MBB (64493) pairs exclusively with lumbar/lumbosacral spondylosis codes (M47.896, M47.897). Remember: facet procedures require spondylosis, not radiculopathy or nonspecific back pain.",
      difficulty: 2,
    },

    // Round 7: CPT 64633 — RFA C/T 1st (Difficulty 2)
    {
      id: "lk-facet-3",
      cptCode: "64633",
      cptDescription:
        "Radiofrequency ablation, cervical or thoracic facet, first level",
      category: "Facet Joint (MBB + RFA)",
      subcategory: "RFA C/T 1st",
      scenario:
        "A 60-year-old retired mechanic with chronic neck pain had two sets of diagnostic cervical medial branch blocks at C3-4 and C4-5, each providing greater than 80% pain relief for the expected duration. He is now scheduled for radiofrequency ablation to provide longer-lasting facet denervation.",
      options: [
        {
          code: "M47.892",
          description: "Other spondylosis, cervical region",
          isCorrect: true,
        },
        {
          code: "M47.894",
          description: "Other spondylosis, thoracic region",
          isCorrect: true,
        },
        {
          code: "M54.2",
          description: "Cervicalgia",
          isCorrect: false,
          explanation:
            "Too nonspecific — even though the patient has neck pain, RFA requires documentation of spondylosis as the underlying structural diagnosis.",
        },
        {
          code: "G89.29",
          description: "Other chronic pain",
          isCorrect: false,
          explanation:
            "Too nonspecific — chronic pain codes do not establish the facet-mediated etiology required for radiofrequency ablation authorization.",
        },
        {
          code: "M47.896",
          description: "Other spondylosis, lumbar region",
          isCorrect: false,
          explanation:
            "Wrong body region — lumbar spondylosis pairs with lumbar RFA (64635), not cervical/thoracic RFA (64633).",
        },
        {
          code: "M54.13",
          description: "Radiculopathy, cervicothoracic region",
          isCorrect: false,
          explanation:
            "Radiculopathy is not an approved indication for facet RFA. Radicular symptoms are treated with epidural injections, not facet denervation.",
        },
      ],
      revealNote:
        "RFA C/T (64633) uses the same spondylosis codes as cervical MBB (64490). RFA is performed only after two positive diagnostic MBBs confirming facet-mediated pain. Denervation effect typically lasts 6-12 months.",
      difficulty: 2,
    },

    // Round 8: CPT 64635 — RFA L/S 1st (Difficulty 3)
    {
      id: "lk-facet-4",
      cptCode: "64635",
      cptDescription:
        "Radiofrequency ablation, lumbar or sacral facet, first level",
      category: "Facet Joint (MBB + RFA)",
      subcategory: "RFA L/S 1st",
      scenario:
        "A 67-year-old woman with multilevel lumbar facet arthropathy confirmed on CT has completed the dual diagnostic block paradigm with >80% concordant relief from L3-4 and L4-5 medial branch blocks on two separate occasions. She presents for therapeutic radiofrequency ablation at the same levels.",
      options: [
        {
          code: "M47.896",
          description: "Other spondylosis, lumbar region",
          isCorrect: true,
        },
        {
          code: "M47.897",
          description: "Other spondylosis, lumbosacral region",
          isCorrect: true,
        },
        {
          code: "M54.5",
          description: "Low back pain",
          isCorrect: false,
          explanation:
            "Too nonspecific — low back pain does not support RFA. The dual-block paradigm must be tied to a spondylosis diagnosis for payer approval.",
        },
        {
          code: "M47.892",
          description: "Other spondylosis, cervical region",
          isCorrect: false,
          explanation:
            "Wrong body region — cervical spondylosis codes pair with cervical RFA (64633), not lumbar RFA (64635).",
        },
        {
          code: "M47.812",
          description: "Spondylosis with myelopathy, cervical",
          isCorrect: false,
          explanation:
            "Wrong body region and wrong subtype — myelopathy codes are never approved for facet RFA procedures.",
        },
        {
          code: "M51.16",
          description: "IVD disorder with radiculopathy, lumbar",
          isCorrect: false,
          explanation:
            "Disc-related radiculopathy is an indication for epidural injections, not for facet radiofrequency ablation.",
        },
        {
          code: "M54.42",
          description: "Lumbago with sciatica, left side",
          isCorrect: false,
          explanation:
            "Sciatica indicates nerve root irritation, not facet-mediated pain. Facet RFA targets the medial branch nerves innervating the facet joints.",
        },
        {
          code: "M79.3",
          description: "Panniculitis, unspecified",
          isCorrect: false,
          explanation:
            "Unrelated soft tissue diagnosis — panniculitis is inflammation of subcutaneous fat and has no relevance to facet joint denervation.",
        },
      ],
      revealNote:
        "Lumbar RFA (64635) pairs exclusively with lumbar/lumbosacral spondylosis (M47.896, M47.897). Key billing point: documentation must include two positive diagnostic MBBs with >80% relief before RFA can be authorized.",
      difficulty: 3,
    },

    // ========== Peripheral Nerve (4 rounds) ==========
    // Round 9: CPT 64405 — Greater Occipital Nerve Block (Difficulty 1)
    {
      id: "lk-pn-1",
      cptCode: "64405",
      cptDescription: "Greater occipital nerve block",
      category: "Peripheral Nerve",
      subcategory: "GON Block",
      scenario:
        "A 38-year-old woman presents with severe, shooting pain originating at the base of the skull and radiating over the vertex to the forehead. The pain is unilateral, described as electric and throbbing, and is exacerbated by neck movement. Tenderness is elicited over the greater occipital nerve at the nuchal ridge.",
      options: [
        {
          code: "M79.2",
          description: "Neuralgia and neuritis, unspecified",
          isCorrect: true,
        },
        {
          code: "M54.81",
          description: "Occipital neuralgia",
          isCorrect: false,
          explanation:
            "While this seems like a perfect match clinically, M54.81 is not on the Stanford approved pairing list for 64405. The approved code is M79.2 (neuralgia and neuritis, unspecified).",
        },
        {
          code: "R51.9",
          description: "Headache, unspecified",
          isCorrect: false,
          explanation:
            "Too nonspecific — unspecified headache does not establish the neuralgia diagnosis required for occipital nerve block authorization.",
        },
        {
          code: "G44.209",
          description:
            "Tension-type headache, unspecified, not intractable",
          isCorrect: false,
          explanation:
            "Not on the approved list — tension-type headache is not an approved indication for greater occipital nerve block at Stanford.",
        },
        {
          code: "M54.2",
          description: "Cervicalgia",
          isCorrect: false,
          explanation:
            "Too nonspecific — cervicalgia describes general neck pain and does not support the targeted nerve block diagnosis.",
        },
        {
          code: "G89.29",
          description: "Other chronic pain",
          isCorrect: false,
          explanation:
            "Too nonspecific — generic chronic pain codes do not establish the specific neuralgia diagnosis needed for nerve block procedures.",
        },
      ],
      revealNote:
        "Greater occipital nerve block (64405) pairs with M79.2 (neuralgia and neuritis, unspecified). Notably, the more specific M54.81 (occipital neuralgia) is NOT on the Stanford approved list — always check your institution's approved pairings.",
      difficulty: 1,
    },

    // Round 10: CPT 64418 — Suprascapular Nerve Block (Difficulty 2)
    {
      id: "lk-pn-2",
      cptCode: "64418",
      cptDescription: "Suprascapular nerve block",
      category: "Peripheral Nerve",
      subcategory: "Suprascapular NB",
      scenario:
        "A 62-year-old man with a massive irreparable rotator cuff tear and glenohumeral osteoarthritis presents with persistent shoulder pain refractory to physical therapy and intra-articular corticosteroid injections. He is not a surgical candidate. The pain team recommends a suprascapular nerve block for pain control.",
      options: [
        {
          code: "G58.9",
          description: "Mononeuropathy, unspecified",
          isCorrect: true,
        },
        {
          code: "M25.511",
          description: "Pain in right shoulder",
          isCorrect: false,
          explanation:
            "Not on the approved list for 64418 — shoulder pain codes pair with other procedures. Suprascapular nerve block requires a neuropathy code.",
        },
        {
          code: "M25.512",
          description: "Pain in left shoulder",
          isCorrect: false,
          explanation:
            "Not on the approved list for 64418 — shoulder joint pain codes are not approved for suprascapular nerve block at Stanford.",
        },
        {
          code: "M79.2",
          description: "Neuralgia and neuritis, unspecified",
          isCorrect: false,
          explanation:
            "While this is a neuralgia code, it is not on the approved pairing list for suprascapular nerve block. This code pairs with greater occipital nerve block (64405) instead.",
        },
        {
          code: "G56.00",
          description: "Carpal tunnel syndrome",
          isCorrect: false,
          explanation:
            "Wrong nerve distribution — carpal tunnel syndrome affects the median nerve at the wrist, not the suprascapular nerve at the shoulder.",
        },
        {
          code: "M79.1",
          description: "Myalgia",
          isCorrect: false,
          explanation:
            "Wrong diagnosis type — myalgia is a muscular pain diagnosis and does not support nerve block procedures.",
        },
        {
          code: "G89.29",
          description: "Other chronic pain",
          isCorrect: false,
          explanation:
            "Too nonspecific — chronic pain codes do not meet the neuropathy-based criteria for suprascapular nerve block authorization.",
        },
      ],
      revealNote:
        "Suprascapular nerve block (64418) pairs with G58.9 (mononeuropathy, unspecified). The suprascapular nerve provides ~70% of shoulder sensory innervation, making this block effective for shoulder pain when joint injections fail.",
      difficulty: 2,
    },

    // Round 11: CPT 64510 — Stellate Ganglion Block (Difficulty 3)
    {
      id: "lk-pn-3",
      cptCode: "64510",
      cptDescription: "Stellate ganglion block",
      category: "Peripheral Nerve",
      subcategory: "Stellate Ganglion",
      scenario:
        "A 44-year-old veteran presents with burning pain, allodynia, and color changes in the right upper extremity following a Colles fracture 6 months ago. Symptoms are consistent with complex regional pain syndrome. He also reports temperature asymmetry between upper limbs. A stellate ganglion block is planned for both diagnostic and therapeutic purposes.",
      options: [
        {
          code: "G54.1",
          description: "Lumbosacral plexus disorders",
          isCorrect: true,
        },
        {
          code: "G90.50",
          description: "Complex regional pain syndrome I, unspecified",
          isCorrect: false,
          explanation:
            "Although CRPS is a common clinical indication for stellate ganglion block, the CRPS I code is not on Stanford's approved pairing list for 64510. The approved code is G54.1.",
        },
        {
          code: "G89.4",
          description: "Chronic pain syndrome",
          isCorrect: false,
          explanation:
            "Too nonspecific — chronic pain syndrome is not approved for stellate ganglion block. A plexus disorder diagnosis is required.",
        },
        {
          code: "G58.9",
          description: "Mononeuropathy, unspecified",
          isCorrect: false,
          explanation:
            "Not on the approved list for stellate ganglion block. This code pairs with suprascapular nerve block (64418) instead.",
        },
        {
          code: "G62.9",
          description: "Polyneuropathy, unspecified",
          isCorrect: false,
          explanation:
            "Too nonspecific — unspecified polyneuropathy does not establish the plexus-level pathology required for stellate ganglion block.",
        },
        {
          code: "G89.29",
          description: "Other chronic pain",
          isCorrect: false,
          explanation:
            "Too nonspecific — generic chronic pain does not meet medical necessity for a sympathetic ganglion block.",
        },
        {
          code: "M79.2",
          description: "Neuralgia and neuritis, unspecified",
          isCorrect: false,
          explanation:
            "Not on the approved pairing list for 64510. Stellate ganglion block requires a plexus disorder code, not a general neuralgia code.",
        },
      ],
      revealNote:
        "Stellate ganglion block (64510) pairs with G54.1 (lumbosacral plexus disorders). This may seem counterintuitive since stellate blocks target sympathetic upper extremity pain, but institutional approved lists can differ from clinical expectations — always verify.",
      difficulty: 3,
    },

    // Round 12: CPT 64450 — Other Peripheral Nerve Block (Difficulty 2)
    {
      id: "lk-pn-4",
      cptCode: "64450",
      cptDescription: "Other peripheral nerve block or injection",
      category: "Peripheral Nerve",
      subcategory: "Other Periph NB",
      scenario:
        "A 70-year-old woman with bilateral hip osteoarthritis presents for evaluation of right hip pain that limits her ability to walk and perform daily activities. She is awaiting total hip arthroplasty and requests interim pain management. The team plans a peripheral nerve block targeting the hip region for pain relief.",
      options: [
        {
          code: "M54.81",
          description: "Occipital neuralgia",
          isCorrect: true,
        },
        {
          code: "M25.511",
          description: "Pain in right shoulder",
          isCorrect: true,
        },
        {
          code: "M25.551",
          description: "Pain in right hip",
          isCorrect: true,
        },
        {
          code: "M25.552",
          description: "Pain in left hip",
          isCorrect: true,
        },
        {
          code: "M54.5",
          description: "Low back pain",
          isCorrect: false,
          explanation:
            "Not on the approved list — low back pain is not an approved indication for CPT 64450. Back pain diagnoses pair with epidural or facet procedures.",
        },
        {
          code: "M25.50",
          description: "Pain in unspecified joint",
          isCorrect: false,
          explanation:
            "Requires laterality — unspecified joint pain will be rejected. Always use the lateralized code (e.g., M25.551 for right hip, M25.552 for left hip).",
        },
        {
          code: "G57.00",
          description: "Sciatic nerve lesion",
          isCorrect: false,
          explanation:
            "Not on the approved pairing list for 64450. Sciatic nerve pathology is typically addressed with different procedure codes.",
        },
      ],
      revealNote:
        "CPT 64450 is a broad 'other peripheral nerve block' code used for various sites. Its approved ICD-10 list is diverse, including occipital neuralgia, shoulder pain, and hip pain codes. Always specify laterality — M25.50 (unspecified joint) will be denied.",
      difficulty: 2,
    },

    // ========== Joint Injections / Denervation (4 rounds) ==========
    // Round 13: CPT 20610 — Large Joint Injection (Difficulty 1)
    {
      id: "lk-jt-1",
      cptCode: "20610",
      cptDescription:
        "Arthrocentesis, aspiration and/or injection, major joint",
      category: "Joint Injections / Denervation",
      subcategory: "Large Joint Inj",
      scenario:
        "A 72-year-old retired marathon runner presents with right knee pain and stiffness for the past 8 months. Physical exam reveals crepitus, mild effusion, and decreased range of motion. Weight-bearing X-rays show medial joint space narrowing and osteophyte formation consistent with tricompartmental osteoarthritis. The patient requests a corticosteroid injection.",
      options: [
        {
          code: "M25.561",
          description: "Pain in right knee",
          isCorrect: true,
        },
        {
          code: "M25.562",
          description: "Pain in left knee",
          isCorrect: false,
          explanation:
            "Wrong laterality — the patient has right knee pain, so the correct code is M25.561 (right knee), not M25.562 (left knee). Laterality must match the treated joint.",
        },
        {
          code: "M25.50",
          description: "Pain in unspecified joint",
          isCorrect: false,
          explanation:
            "Requires laterality — unspecified joint pain does not specify which knee is being injected and will be rejected by payers.",
        },
        {
          code: "M54.5",
          description: "Low back pain",
          isCorrect: false,
          explanation:
            "Wrong body region — low back pain is not an indication for large joint injection. The diagnosis must match the injected joint.",
        },
        {
          code: "M79.3",
          description: "Panniculitis, unspecified",
          isCorrect: false,
          explanation:
            "Unrelated soft tissue diagnosis — panniculitis is inflammation of subcutaneous fat, not a joint disorder.",
        },
        {
          code: "G89.29",
          description: "Other chronic pain",
          isCorrect: false,
          explanation:
            "Too nonspecific — generic chronic pain does not establish the joint-specific diagnosis needed for arthrocentesis/injection.",
        },
      ],
      revealNote:
        "Large joint injection (20610) for the knee pairs with lateralized knee pain codes (M25.561 right, M25.562 left). Laterality is critical — always match the code to the side being injected.",
      difficulty: 1,
    },

    // Round 14: CPT 27096 — SIJ Injection (Difficulty 2)
    {
      id: "lk-jt-2",
      cptCode: "27096",
      cptDescription: "Sacroiliac joint injection",
      category: "Joint Injections / Denervation",
      subcategory: "SI Joint Injection",
      scenario:
        "A 42-year-old postpartum woman presents with low back and buttock pain that is worse with prolonged sitting and transitioning from sitting to standing. Patrick's (FABER) test and Gaenslen's test are positive on the right. Pain is localized to the sacroiliac joint region. MRI shows mild periarticular edema at the right SI joint.",
      options: [
        {
          code: "M53.3",
          description: "Sacrococcygeal disorders, NEC",
          isCorrect: true,
        },
        {
          code: "M46.1",
          description: "Sacroiliitis, NEC",
          isCorrect: false,
          explanation:
            "Although sacroiliitis is the clinical diagnosis, M46.1 is not on Stanford's approved pairing list for SIJ injection (27096). The approved code is M53.3.",
        },
        {
          code: "M54.5",
          description: "Low back pain",
          isCorrect: false,
          explanation:
            "Too nonspecific — low back pain does not localize the pathology to the sacroiliac joint. SIJ injection requires a sacral/coccygeal region diagnosis.",
        },
        {
          code: "M54.42",
          description: "Lumbago with sciatica, left side",
          isCorrect: false,
          explanation:
            "Wrong diagnosis — sciatica implies nerve root irritation, not sacroiliac joint pathology. SIJ-mediated pain is typically referred to the buttock, not in a radicular pattern.",
        },
        {
          code: "M54.17",
          description: "Radiculopathy, lumbosacral region",
          isCorrect: false,
          explanation:
            "Wrong indication — radiculopathy pairs with epidural injections, not SIJ injections. The SI joint does not directly compress nerve roots.",
        },
        {
          code: "M79.1",
          description: "Myalgia",
          isCorrect: false,
          explanation:
            "Wrong diagnosis type — myalgia is muscular pain and does not support SI joint injection. The diagnosis must identify articular pathology.",
        },
        {
          code: "M79.3",
          description: "Panniculitis, unspecified",
          isCorrect: false,
          explanation:
            "Unrelated soft tissue diagnosis — panniculitis has no relevance to sacroiliac joint pathology.",
        },
      ],
      revealNote:
        "SIJ injection (27096) pairs with M53.3 (sacrococcygeal disorders). Note that M46.1 (sacroiliitis) is NOT on the approved list — this is a common billing pitfall. Always verify institutional approved ICD-10 pairings.",
      difficulty: 2,
    },

    // Round 15: CPT 64454 — Genicular Nerve Block (Difficulty 2)
    {
      id: "lk-jt-3",
      cptCode: "64454",
      cptDescription: "Genicular nerve block",
      category: "Joint Injections / Denervation",
      subcategory: "Genicular NB",
      scenario:
        "A 68-year-old man with severe bilateral knee osteoarthritis and a BMI of 38 is not a candidate for total knee arthroplasty due to uncontrolled diabetes and cardiac comorbidities. He has failed physical therapy, bracing, and multiple intra-articular corticosteroid injections. The pain team recommends a diagnostic genicular nerve block to evaluate candidacy for genicular nerve ablation.",
      options: [
        {
          code: "M25.561",
          description: "Pain in right knee",
          isCorrect: true,
        },
        {
          code: "M25.562",
          description: "Pain in left knee",
          isCorrect: true,
        },
        {
          code: "M25.50",
          description: "Pain in unspecified joint",
          isCorrect: false,
          explanation:
            "Requires laterality — unspecified joint pain will be rejected. Genicular nerve blocks are knee-specific and require lateralized knee pain codes.",
        },
        {
          code: "M25.551",
          description: "Pain in right hip",
          isCorrect: false,
          explanation:
            "Wrong joint — hip pain codes pair with hip procedures, not genicular (knee) nerve blocks.",
        },
        {
          code: "G89.29",
          description: "Other chronic pain",
          isCorrect: false,
          explanation:
            "Too nonspecific — generic chronic pain does not establish the knee-specific diagnosis needed for genicular nerve block.",
        },
        {
          code: "G57.00",
          description: "Sciatic nerve lesion",
          isCorrect: false,
          explanation:
            "Wrong nerve — sciatic nerve pathology is distinct from genicular nerve dysfunction. Genicular nerves are small articular branches innervating the knee joint capsule.",
        },
        {
          code: "M79.1",
          description: "Myalgia",
          isCorrect: false,
          explanation:
            "Wrong diagnosis type — myalgia indicates muscular pain and does not support genicular nerve block for joint pain.",
        },
      ],
      revealNote:
        "Genicular nerve block (64454) pairs with lateralized knee pain codes (M25.561, M25.562). This diagnostic block evaluates for genicular nerve ablation candidacy. Two positive blocks with >50% relief are typically required before ablation.",
      difficulty: 2,
    },

    // Round 16: CPT 64624 — Genicular Nerve Ablation (Difficulty 3)
    {
      id: "lk-jt-4",
      cptCode: "64624",
      cptDescription: "Genicular nerve radiofrequency ablation",
      category: "Joint Injections / Denervation",
      subcategory: "Genicular RFA",
      scenario:
        "A 74-year-old woman with bilateral knee osteoarthritis completed two diagnostic genicular nerve blocks to her left knee, each providing >50% pain relief lasting the expected duration. She is now scheduled for radiofrequency ablation of the left superior medial, superior lateral, and inferior medial genicular nerves for long-term pain management.",
      options: [
        {
          code: "M25.561",
          description: "Pain in right knee",
          isCorrect: true,
        },
        {
          code: "M25.562",
          description: "Pain in left knee",
          isCorrect: true,
        },
        {
          code: "M25.50",
          description: "Pain in unspecified joint",
          isCorrect: false,
          explanation:
            "Requires laterality — genicular RFA targets a specific knee, so the lateralized code must be used. Unspecified joint pain will be denied.",
        },
        {
          code: "G89.4",
          description: "Chronic pain syndrome",
          isCorrect: false,
          explanation:
            "Too nonspecific — chronic pain syndrome is not an approved diagnosis for genicular nerve ablation. Knee-specific pain codes are required.",
        },
        {
          code: "M25.511",
          description: "Pain in right shoulder",
          isCorrect: false,
          explanation:
            "Wrong body region — shoulder pain is not an indication for genicular (knee) nerve ablation.",
        },
        {
          code: "G89.29",
          description: "Other chronic pain",
          isCorrect: false,
          explanation:
            "Too nonspecific — a generic chronic pain code does not establish the knee-specific diagnosis required for genicular nerve ablation authorization.",
        },
        {
          code: "M47.896",
          description: "Other spondylosis, lumbar region",
          isCorrect: false,
          explanation:
            "Wrong body region — spondylosis codes pair with spinal facet procedures, not peripheral joint denervation.",
        },
      ],
      revealNote:
        "Genicular RFA (64624) uses the same lateralized knee pain codes as genicular nerve block (M25.561, M25.562). Both codes are approved regardless of which knee is treated — but documentation must specify the treated side.",
      difficulty: 3,
    },

    // ========== Neuromodulation (SCS + PNS) (4 rounds) ==========
    // Round 17: CPT 63650 — SCS Lead Implant (Difficulty 2)
    {
      id: "lk-nm-1",
      cptCode: "63650",
      cptDescription:
        "Spinal cord stimulator, percutaneous lead implantation",
      category: "Neuromodulation (SCS + PNS)",
      subcategory: "SCS Lead Implant",
      scenario:
        "A 56-year-old man with failed back surgery syndrome after L4-5 and L5-S1 fusion continues to have debilitating bilateral lower extremity neuropathic pain despite maximum medical therapy. He has failed physical therapy, multiple epidural injections, and medication management including gabapentin and duloxetine. Psychological evaluation clears him for a spinal cord stimulator trial.",
      options: [
        {
          code: "G89.4",
          description: "Chronic pain syndrome",
          isCorrect: true,
        },
        {
          code: "M54.13",
          description: "Radiculopathy, cervicothoracic region",
          isCorrect: true,
        },
        {
          code: "M54.15",
          description: "Radiculopathy, thoracolumbar region",
          isCorrect: true,
        },
        {
          code: "G57.70",
          description: "Causalgia of unspecified lower limb",
          isCorrect: true,
        },
        {
          code: "M54.5",
          description: "Low back pain",
          isCorrect: false,
          explanation:
            "Too nonspecific — isolated mechanical low back pain is generally not an approved indication for SCS. Neuropathic pain or radiculopathy must be documented.",
        },
        {
          code: "G62.9",
          description: "Polyneuropathy, unspecified",
          isCorrect: false,
          explanation:
            "Too nonspecific — unspecified polyneuropathy does not meet the documentation requirements for SCS implantation. Specific neuropathy diagnoses are required.",
        },
        {
          code: "G89.29",
          description: "Other chronic pain",
          isCorrect: false,
          explanation:
            "Too nonspecific — 'other chronic pain' does not establish the neuropathic etiology required for SCS authorization. Use G89.4 (chronic pain syndrome) or specific neuropathy codes.",
        },
        {
          code: "M54.42",
          description: "Lumbago with sciatica, left side",
          isCorrect: false,
          explanation:
            "Not on the approved pairing list for SCS. Use radiculopathy codes (M54.13, M54.15, M54.17) or chronic pain syndrome (G89.4) instead.",
        },
      ],
      revealNote:
        "SCS lead implant (63650) has a broad approved ICD-10 list reflecting its use for diverse chronic pain conditions. Key approved categories include radiculopathy, CRPS/causalgia, postherpetic neuralgia, diabetic neuropathy, and chronic pain syndrome.",
      difficulty: 2,
    },

    // Round 18: CPT 63685 — SCS Generator Implant (Difficulty 2)
    {
      id: "lk-nm-2",
      cptCode: "63685",
      cptDescription:
        "Spinal cord stimulator, implantable pulse generator insertion or replacement",
      category: "Neuromodulation (SCS + PNS)",
      subcategory: "SCS IPG Implant",
      scenario:
        "A 50-year-old woman completed a successful 7-day SCS trial with >50% pain relief for her chronic bilateral lower extremity pain from postherpetic neuralgia following a T10 dermatome herpes zoster outbreak. She is now scheduled for permanent SCS pulse generator implantation.",
      options: [
        {
          code: "B02.23",
          description: "Postherpetic polyneuropathy",
          isCorrect: true,
        },
        {
          code: "E13.41",
          description: "Other specified DM with diabetic mononeuropathy",
          isCorrect: true,
        },
        {
          code: "G58.8",
          description: "Other specified mononeuropathies",
          isCorrect: true,
        },
        {
          code: "G90.50",
          description: "Complex regional pain syndrome I, unspecified",
          isCorrect: true,
        },
        {
          code: "G62.9",
          description: "Polyneuropathy, unspecified",
          isCorrect: false,
          explanation:
            "Too nonspecific — unspecified polyneuropathy is not on the approved list. SCS authorization requires specific neuropathy diagnoses (e.g., postherpetic, diabetic, CRPS).",
        },
        {
          code: "M54.5",
          description: "Low back pain",
          isCorrect: false,
          explanation:
            "Too nonspecific — mechanical low back pain is not an approved indication for SCS IPG implantation without neuropathic component.",
        },
        {
          code: "G89.29",
          description: "Other chronic pain",
          isCorrect: false,
          explanation:
            "Too nonspecific — 'other chronic pain' does not meet the criteria for SCS generator implant. Specific neuropathic pain diagnoses are required.",
        },
      ],
      revealNote:
        "SCS generator implant (63685) shares the same approved ICD-10 list as the lead implant (63650). The generator is implanted after a successful trial period (typically 5-10 days) demonstrating >50% pain relief.",
      difficulty: 2,
    },

    // Round 19: CPT 64555 — PNS Implant (Difficulty 3)
    {
      id: "lk-nm-3",
      cptCode: "64555",
      cptDescription:
        "Peripheral nerve stimulator, percutaneous electrode implantation",
      category: "Neuromodulation (SCS + PNS)",
      subcategory: "PNS Implant",
      scenario:
        "A 48-year-old woman with refractory CRPS type I of the left upper extremity following a wrist fracture has failed multiple stellate ganglion blocks, physical therapy, and medication trials. She has severe allodynia and temperature asymmetry. The team recommends peripheral nerve stimulator implantation targeting the affected upper extremity nerves.",
      options: [
        {
          code: "G56.42",
          description: "Causalgia of left upper limb",
          isCorrect: true,
        },
        {
          code: "G90.512",
          description: "CRPS I of left upper limb",
          isCorrect: true,
        },
        {
          code: "G58.8",
          description: "Other specified mononeuropathies",
          isCorrect: true,
        },
        {
          code: "B02.23",
          description: "Postherpetic polyneuropathy",
          isCorrect: true,
        },
        {
          code: "G90.50",
          description: "Complex regional pain syndrome I, unspecified",
          isCorrect: false,
          explanation:
            "Requires laterality — unspecified CRPS I is not on the approved list for PNS. Use lateralized CRPS codes (e.g., G90.511, G90.512) instead.",
        },
        {
          code: "G56.00",
          description: "Carpal tunnel syndrome",
          isCorrect: false,
          explanation:
            "Not on the approved list — carpal tunnel syndrome is a compressive neuropathy typically treated with decompression surgery, not peripheral nerve stimulation.",
        },
        {
          code: "G62.9",
          description: "Polyneuropathy, unspecified",
          isCorrect: false,
          explanation:
            "Too nonspecific — unspecified polyneuropathy does not meet the criteria for PNS implantation. Specific neuropathy diagnoses with laterality are required.",
        },
        {
          code: "G89.29",
          description: "Other chronic pain",
          isCorrect: false,
          explanation:
            "Too nonspecific — generic chronic pain does not support PNS implantation. Specific neuropathic conditions must be documented.",
        },
      ],
      revealNote:
        "PNS implant (64555) has the broadest approved ICD-10 list of any neuromodulation code, with 18 approved diagnoses including lateralized CRPS, causalgia, and various mononeuropathies. Note that G90.50 (unspecified CRPS) is NOT approved — laterality is required.",
      difficulty: 3,
    },

    // Round 20: CPT 64561 — PNS Sacral (Difficulty 1)
    {
      id: "lk-nm-4",
      cptCode: "64561",
      cptDescription:
        "Peripheral nerve stimulator, percutaneous electrode implantation, sacral nerve",
      category: "Neuromodulation (SCS + PNS)",
      subcategory: "PNS Sacral",
      scenario:
        "A 55-year-old man presents with chronic perineal and sacral pain following a herpes zoster outbreak in the S2-S4 dermatomes one year ago. Despite antiviral therapy and multiple medication trials, he continues to have debilitating postherpetic neuralgia in the sacral region. Sacral peripheral nerve stimulation is being considered.",
      options: [
        {
          code: "B02.23",
          description: "Postherpetic polyneuropathy",
          isCorrect: true,
        },
        {
          code: "G89.4",
          description: "Chronic pain syndrome",
          isCorrect: false,
          explanation:
            "Not on the approved list for sacral PNS (64561). Chronic pain syndrome is approved for SCS (63650/63685) but not for sacral nerve stimulation.",
        },
        {
          code: "G90.50",
          description: "Complex regional pain syndrome I, unspecified",
          isCorrect: false,
          explanation:
            "Not on the approved list for sacral PNS. CRPS codes are approved for general PNS (64555) but not the sacral-specific code.",
        },
        {
          code: "G58.9",
          description: "Mononeuropathy, unspecified",
          isCorrect: false,
          explanation:
            "Not on the approved list for sacral PNS (64561). This code pairs with suprascapular nerve block (64418) instead.",
        },
        {
          code: "G62.9",
          description: "Polyneuropathy, unspecified",
          isCorrect: false,
          explanation:
            "Too nonspecific — unspecified polyneuropathy is not approved for any neuromodulation code. The specific postherpetic polyneuropathy code (B02.23) is required.",
        },
        {
          code: "G89.29",
          description: "Other chronic pain",
          isCorrect: false,
          explanation:
            "Too nonspecific — generic chronic pain does not support sacral PNS implantation.",
        },
      ],
      revealNote:
        "Sacral PNS (64561) has the most restricted approved list in the neuromodulation category — only B02.23 (postherpetic polyneuropathy) is approved. This contrasts sharply with general PNS (64555) which has 18 approved codes.",
      difficulty: 1,
    },

    // ========== Botox / MIS / Other (4 rounds) ==========
    // Round 21: CPT 64615 — Botox Chronic Migraine (Difficulty 2)
    {
      id: "lk-btx-1",
      cptCode: "64615",
      cptDescription:
        "Chemodenervation of muscle(s); muscle(s) innervated by facial, trigeminal, cervical spinal and accessory nerves, bilateral (chronic migraine)",
      category: "Botox / MIS / Other",
      subcategory: "Botox Migraine",
      scenario:
        "A 36-year-old woman with a 10-year history of migraine headaches now meets criteria for chronic migraine with 18 headache days per month, of which 10 are migrainous. She has failed topiramate, amitriptyline, and two CGRP monoclonal antibodies. She is being evaluated for onabotulinumtoxinA injection using the PREEMPT protocol.",
      options: [
        {
          code: "G43.709",
          description:
            "Chronic migraine w/o aura, not intractable, w/o status migrainosus",
          isCorrect: true,
        },
        {
          code: "G43.711",
          description:
            "Chronic migraine w/o aura, intractable, w/ status migrainosus",
          isCorrect: true,
        },
        {
          code: "G43.719",
          description:
            "Chronic migraine w/o aura, intractable, w/o status migrainosus",
          isCorrect: true,
        },
        {
          code: "G44.221",
          description: "Chronic tension-type headache, intractable",
          isCorrect: true,
        },
        {
          code: "G43.909",
          description: "Migraine, unspecified",
          isCorrect: false,
          explanation:
            "Not chronic migraine — unspecified migraine does not meet the chronic migraine criteria (>15 headache days/month for >3 months) required for Botox authorization.",
        },
        {
          code: "G43.001",
          description: "Migraine w/o aura, not intractable",
          isCorrect: false,
          explanation:
            "Not chronic migraine — episodic migraine without aura is not an approved indication for onabotulinumtoxinA. Must document chronic migraine (G43.7xx).",
        },
        {
          code: "R51.9",
          description: "Headache, unspecified",
          isCorrect: false,
          explanation:
            "Too nonspecific — unspecified headache does not establish the chronic migraine diagnosis required for Botox authorization.",
        },
        {
          code: "G44.209",
          description:
            "Tension-type headache, unspecified, not intractable",
          isCorrect: false,
          explanation:
            "Not chronic tension-type — this is unspecified, non-intractable tension headache. Only chronic tension-type headache (G44.221, G44.229) is on the approved list.",
        },
      ],
      revealNote:
        "Botox for chronic migraine (64615) requires specific chronic migraine codes (G43.7xx) or chronic tension-type headache codes (G44.22x). Episodic migraine and unspecified headache codes will NOT be approved. Documentation must show >15 headache days/month for >3 months.",
      difficulty: 2,
    },

    // Round 22: CPT 64612 — Botox Facial/Masseters (Difficulty 2)
    {
      id: "lk-btx-2",
      cptCode: "64612",
      cptDescription:
        "Chemodenervation of muscle(s); muscle(s) innervated by facial nerve, unilateral",
      category: "Botox / MIS / Other",
      subcategory: "Botox Facial",
      scenario:
        "A 29-year-old woman presents with involuntary, sustained jaw clenching and difficulty opening her mouth due to masseter and temporalis muscle spasm. EMG shows involuntary muscle contractions consistent with oromandibular dystonia. The condition significantly impairs her ability to eat and speak. She has failed oral muscle relaxants and physical therapy.",
      options: [
        {
          code: "G24.4",
          description: "Idiopathic orofacial dystonia",
          isCorrect: true,
        },
        {
          code: "G24.2",
          description: "Idiopathic nonfamilial dystonia",
          isCorrect: false,
          explanation:
            "Not on the approved list for 64612 — idiopathic nonfamilial dystonia is approved for extremity Botox (64642) but not for facial chemodenervation.",
        },
        {
          code: "G24.9",
          description: "Dystonia, unspecified",
          isCorrect: false,
          explanation:
            "Not on the approved list for 64612 — unspecified dystonia is approved for extremity Botox (64642), not facial. Use the specific orofacial dystonia code G24.4.",
        },
        {
          code: "G24.1",
          description: "Genetic torsion dystonia",
          isCorrect: false,
          explanation:
            "Wrong subtype — genetic torsion dystonia is a hereditary generalized dystonia, not the idiopathic orofacial form. This code is not approved for facial Botox.",
        },
        {
          code: "G24.8",
          description: "Other dystonia",
          isCorrect: false,
          explanation:
            "Less specific variant — 'other dystonia' is not on the approved list. When the dystonia is orofacial, the specific code G24.4 must be used.",
        },
        {
          code: "M62.838",
          description: "Other muscle spasm",
          isCorrect: false,
          explanation:
            "Not on the approved list for 64612 — muscle spasm is approved for extremity Botox (64642) but not for facial chemodenervation.",
        },
        {
          code: "R51.9",
          description: "Headache, unspecified",
          isCorrect: false,
          explanation:
            "Not an approved indication — headache codes pair with Botox for chronic migraine (64615), not facial chemodenervation (64612).",
        },
      ],
      revealNote:
        "Botox for facial muscles (64612) has a very narrow approved list — only G24.4 (idiopathic orofacial dystonia). This is distinct from the broader dystonia codes approved for extremity Botox (64642). Matching the correct dystonia subtype to the body region is critical.",
      difficulty: 2,
    },

    // Round 23: CPT 64642 — Botox Extremities 1-4 Muscles (Difficulty 3)
    {
      id: "lk-btx-3",
      cptCode: "64642",
      cptDescription:
        "Chemodenervation of one extremity; 1-4 muscles",
      category: "Botox / MIS / Other",
      subcategory: "Botox Extremity",
      scenario:
        "A 35-year-old man with cerebral palsy presents with progressive upper extremity spasticity affecting his right hand and forearm, limiting his ability to perform fine motor tasks. Examination reveals increased tone in the finger flexors and wrist flexors with a Modified Ashworth Scale score of 3. He has failed oral baclofen and tizanidine due to sedation. The team plans chemodenervation of 3 muscles in the right forearm.",
      options: [
        {
          code: "G24.2",
          description: "Idiopathic nonfamilial dystonia",
          isCorrect: true,
        },
        {
          code: "G24.9",
          description: "Dystonia, unspecified",
          isCorrect: true,
        },
        {
          code: "M62.838",
          description: "Other muscle spasm",
          isCorrect: true,
        },
        {
          code: "G83.89",
          description: "Other specified paralytic syndromes",
          isCorrect: true,
        },
        {
          code: "G24.4",
          description: "Idiopathic orofacial dystonia",
          isCorrect: false,
          explanation:
            "Wrong body region — orofacial dystonia is approved for facial Botox (64612), not extremity chemodenervation (64642).",
        },
        {
          code: "G24.1",
          description: "Genetic torsion dystonia",
          isCorrect: false,
          explanation:
            "Wrong subtype — genetic torsion dystonia is a hereditary condition not on the approved list for extremity Botox. Use idiopathic nonfamilial dystonia (G24.2) instead.",
        },
        {
          code: "G56.00",
          description: "Carpal tunnel syndrome",
          isCorrect: false,
          explanation:
            "Wrong diagnosis — carpal tunnel is a compressive neuropathy treated with decompression, not chemodenervation. Botox is used for spasticity and dystonia.",
        },
        {
          code: "M79.1",
          description: "Myalgia",
          isCorrect: false,
          explanation:
            "Wrong diagnosis type — myalgia is simple muscle pain without the spasticity or dystonia that justifies chemodenervation.",
        },
      ],
      revealNote:
        "Extremity Botox (64642) approved codes include dystonia (G24.2, G24.9), muscle spasm (M62.838), and paralytic syndromes (G83.89). Note the distinction: facial dystonia (G24.4) pairs only with 64612, while nonfamilial dystonia (G24.2) pairs only with 64642.",
      difficulty: 3,
    },

    // Round 24: CPT 0275T — MILD Procedure (Difficulty 1)
    {
      id: "lk-btx-4",
      cptCode: "0275T",
      cptDescription:
        "Percutaneous laminotomy/laminectomy for decompression, lumbar (MILD procedure)",
      category: "Botox / MIS / Other",
      subcategory: "MILD Procedure",
      scenario:
        "A 71-year-old woman presents with progressive neurogenic claudication limiting her walking distance to less than half a block. She has to lean on a shopping cart to walk through a grocery store. MRI shows significant ligamentum flavum hypertrophy at L4-5 causing moderate-to-severe central canal stenosis. She prefers a minimally invasive approach over open surgery.",
      options: [
        {
          code: "M48.062",
          description:
            "Spinal stenosis, lumbar with neurogenic claudication",
          isCorrect: true,
        },
        {
          code: "M54.5",
          description: "Low back pain",
          isCorrect: false,
          explanation:
            "Too nonspecific — low back pain does not establish the spinal stenosis with neurogenic claudication diagnosis required for the MILD procedure.",
        },
        {
          code: "M54.17",
          description: "Radiculopathy, lumbosacral region",
          isCorrect: false,
          explanation:
            "Wrong indication — radiculopathy is a nerve root compression diagnosis. MILD targets ligamentum flavum hypertrophy causing central stenosis, not foraminal narrowing.",
        },
        {
          code: "M99.33",
          description: "Osseous stenosis of neural canal, lumbar region",
          isCorrect: false,
          explanation:
            "Not on the approved list — osseous stenosis is a bony narrowing diagnosis. MILD specifically addresses soft tissue (ligamentum flavum) stenosis, and this code is not approved for 0275T.",
        },
        {
          code: "M47.816",
          description: "Spondylosis with myelopathy, lumbar",
          isCorrect: false,
          explanation:
            "Not on the approved list — myelopathy indicates spinal cord compression, which is not the target pathology for the MILD procedure.",
        },
        {
          code: "M51.16",
          description: "IVD disorder with radiculopathy, lumbar",
          isCorrect: false,
          explanation:
            "Wrong pathology — disc-related radiculopathy is not the indication for MILD. The procedure targets ligamentum flavum hypertrophy.",
        },
        {
          code: "G89.29",
          description: "Other chronic pain",
          isCorrect: false,
          explanation:
            "Too nonspecific — generic chronic pain does not meet the specific stenosis-with-claudication criteria for MILD procedure authorization.",
        },
      ],
      revealNote:
        "The MILD procedure (0275T) has the narrowest approved ICD-10 pairing — only M48.062 (lumbar spinal stenosis with neurogenic claudication). This Category III CPT code is specifically designed for percutaneous decompression of ligamentum flavum hypertrophy.",
      difficulty: 1,
    },
  ],
};

export default lockAndKeyPain;
