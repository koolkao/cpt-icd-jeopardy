import { CodeSerpentGameConfig } from "../types";

const codeSerpentPain: CodeSerpentGameConfig = {
  id: "code-serpent-pain",
  gameMode: "code-serpent",
  title: "CODE SERPENT",
  subtitle: "CPT/ICD Arena Challenge",
  password: "pain123",
  categories: [
    { name: "Epidural Injections", shortName: "Epidurals" },
    { name: "Facet Joint Procedures", shortName: "Facet" },
    { name: "Peripheral Nerve", shortName: "Periph Nerve" },
    { name: "Joint Injections", shortName: "Joints" },
    { name: "Neuromodulation", shortName: "Neuromod" },
    { name: "Mixed Pain Codes", shortName: "Mixed" },
  ],
  scenarios: [
    // Round 1: Lumbar ESI
    {
      id: "cs-r1",
      scenarioText:
        "A 58-year-old presents with L5 radiculopathy and MRI-confirmed L4-5 disc herniation. You perform a lumbar interlaminar epidural steroid injection.",
      category: "Epidural Injections",
      correctCodes: [
        { code: "62323", description: "ILESI, lumbar/sacral" },
        { code: "M54.17", description: "Radiculopathy, lumbosacral" },
        { code: "M51.16", description: "Disc disorder with radiculopathy, lumbar" },
      ],
      incorrectCodes: [
        { code: "62321", description: "ILESI, cervical/thoracic" },
        { code: "64483", description: "TFESI, lumbar/sacral" },
        { code: "M54.2", description: "Cervicalgia" },
        { code: "G89.29", description: "Other chronic pain" },
        { code: "62322", description: "ILESI C/T add-on" },
      ],
      teachingNote:
        "CPT 62323 is the correct code for lumbar/sacral interlaminar ESI. M54.17 (lumbosacral radiculopathy) supports medical necessity. 64483 is for transforaminal ESI, a different approach.",
    },

    // Round 2: Cervical TFESI
    {
      id: "cs-r2",
      scenarioText:
        "A 45-year-old software engineer has C6 radiculopathy with foraminal stenosis at C5-6. You perform a cervical transforaminal epidural steroid injection.",
      category: "Epidural Injections",
      correctCodes: [
        { code: "64479", description: "TFESI, cervical/thoracic" },
        { code: "M54.12", description: "Radiculopathy, cervical" },
        { code: "M50.121", description: "Cervical disc disorder with radiculopathy, C5-C6" },
      ],
      incorrectCodes: [
        { code: "64483", description: "TFESI, lumbar/sacral" },
        { code: "62321", description: "ILESI, cervical/thoracic" },
        { code: "M54.2", description: "Cervicalgia" },
        { code: "64480", description: "TFESI C/T add-on" },
        { code: "M47.812", description: "Spondylosis with myelopathy, cervical" },
      ],
      teachingNote:
        "CPT 64479 is for cervical/thoracic TFESI (single level). 64480 is the add-on for additional levels. 62321 is the interlaminar approach — a completely different technique.",
    },

    // Round 3: Medial Branch Block
    {
      id: "cs-r3",
      scenarioText:
        "A 62-year-old with chronic low back pain localized to the facet joints undergoes bilateral L3-L5 medial branch blocks for diagnostic purposes.",
      category: "Facet Joint Procedures",
      correctCodes: [
        { code: "64493", description: "Facet joint nerve block, lumbar/sacral, 1st level" },
        { code: "64494", description: "Facet joint nerve block, lumbar/sacral, 2nd level add-on" },
        { code: "M47.817", description: "Spondylosis without myelopathy, lumbosacral" },
      ],
      incorrectCodes: [
        { code: "64490", description: "Facet joint nerve block, cervical/thoracic, 1st level" },
        { code: "64635", description: "RFA, lumbar/sacral, 1st facet" },
        { code: "M54.5", description: "Low back pain" },
        { code: "64495", description: "Facet joint nerve block, lumbar/sacral, 3rd+ level add-on" },
        { code: "62323", description: "ILESI, lumbar/sacral" },
      ],
      teachingNote:
        "64493 is the first-level lumbar MBB, 64494 is the add-on for each additional level. MBBs are diagnostic — if positive (>=80% relief), the patient qualifies for RFA (64635). M54.5 alone is often too nonspecific.",
    },

    // Round 4: Radiofrequency Ablation
    {
      id: "cs-r4",
      scenarioText:
        "After two positive diagnostic medial branch blocks, a 55-year-old undergoes radiofrequency ablation of L3-L5 medial branches bilaterally for facet-mediated low back pain.",
      category: "Facet Joint Procedures",
      correctCodes: [
        { code: "64635", description: "RFA, lumbar/sacral, 1st facet joint" },
        { code: "64636", description: "RFA, lumbar/sacral, each additional facet add-on" },
        { code: "M47.817", description: "Spondylosis without myelopathy, lumbosacral" },
      ],
      incorrectCodes: [
        { code: "64633", description: "RFA, cervical/thoracic, 1st facet" },
        { code: "64493", description: "MBB, lumbar/sacral, 1st level" },
        { code: "M54.5", description: "Low back pain" },
        { code: "G89.29", description: "Other chronic pain" },
        { code: "64634", description: "RFA, cervical/thoracic, add-on" },
      ],
      teachingNote:
        "64635 is the primary code for lumbar RFA, 64636 is the add-on for each additional facet. Two positive diagnostic MBBs (>=80% relief) are required before RFA. 64633/64634 are for cervical/thoracic region.",
    },

    // Round 5: Peripheral Nerve Block
    {
      id: "cs-r5",
      scenarioText:
        "A 40-year-old runner presents with lateral knee pain consistent with common peroneal neuropathy. You perform an ultrasound-guided common peroneal nerve block.",
      category: "Peripheral Nerve",
      correctCodes: [
        { code: "64450", description: "Peripheral nerve block, other" },
        { code: "G57.30", description: "Lesion of lateral popliteal nerve, unspecified" },
        { code: "76942", description: "Ultrasound guidance for needle placement" },
      ],
      incorrectCodes: [
        { code: "64447", description: "Femoral nerve block" },
        { code: "64415", description: "Brachial plexus block" },
        { code: "M79.3", description: "Panniculitis, unspecified" },
        { code: "64448", description: "Sciatic nerve block" },
        { code: "M25.561", description: "Pain in right knee" },
      ],
      teachingNote:
        "64450 is the catch-all code for peripheral nerve blocks not otherwise specified. 76942 is separately billable for ultrasound guidance. Using specific diagnosis codes (G57.30) rather than generic pain codes supports medical necessity.",
    },

    // Round 6: SI Joint Injection
    {
      id: "cs-r6",
      scenarioText:
        "A 50-year-old with positive provocative testing for sacroiliac joint dysfunction undergoes a fluoroscopy-guided SI joint injection.",
      category: "Joint Injections",
      correctCodes: [
        { code: "27096", description: "SI joint injection" },
        { code: "M53.3", description: "Sacrococcygeal disorders, NEC" },
        { code: "77003", description: "Fluoroscopic guidance for needle placement" },
      ],
      incorrectCodes: [
        { code: "20610", description: "Major joint injection (e.g., knee, shoulder)" },
        { code: "62323", description: "ILESI, lumbar/sacral" },
        { code: "M54.5", description: "Low back pain" },
        { code: "G89.29", description: "Other chronic pain" },
        { code: "20605", description: "Intermediate joint injection" },
      ],
      teachingNote:
        "27096 is specific to SI joint injection. 20610 is for major peripheral joints (knee, shoulder, hip). 77003 is the fluoroscopic guidance code, billable separately. Generic LBP codes are insufficient.",
    },

    // Round 7: Spinal Cord Stimulator Trial
    {
      id: "cs-r7",
      scenarioText:
        "A patient with failed back surgery syndrome and chronic bilateral leg pain undergoes a percutaneous spinal cord stimulator trial.",
      category: "Neuromodulation",
      correctCodes: [
        { code: "63650", description: "Percutaneous implantation of neurostimulator electrode" },
        { code: "M96.1", description: "Postlaminectomy syndrome, not elsewhere classified" },
        { code: "G89.4", description: "Chronic pain syndrome" },
      ],
      incorrectCodes: [
        { code: "63685", description: "Insertion of IPG for SCS (permanent)" },
        { code: "63688", description: "Revision of neurostimulator IPG" },
        { code: "M54.5", description: "Low back pain" },
        { code: "64590", description: "Insertion of peripheral neurostimulator" },
        { code: "63661", description: "Removal of SCS electrode" },
      ],
      teachingNote:
        "63650 is for the percutaneous SCS trial electrode placement. 63685 is for the permanent IPG implant (done after a successful trial). M96.1 (post-laminectomy syndrome / FBSS) is a strong supporting diagnosis for SCS.",
    },

    // Round 8: Trigger Point Injections
    {
      id: "cs-r8",
      scenarioText:
        "A 35-year-old with myofascial pain syndrome in the upper trapezius undergoes trigger point injections at 3 sites bilaterally.",
      category: "Mixed Pain Codes",
      correctCodes: [
        { code: "20552", description: "Trigger point injection, 1-2 muscles" },
        { code: "20553", description: "Trigger point injection, 3+ muscles" },
        { code: "M79.11", description: "Myalgia, neck" },
      ],
      incorrectCodes: [
        { code: "20550", description: "Tendon sheath injection" },
        { code: "J0585", description: "Botulinum toxin type A (onabotulinumtoxinA)" },
        { code: "M54.2", description: "Cervicalgia" },
        { code: "20610", description: "Major joint injection" },
        { code: "96372", description: "Therapeutic injection, SC/IM" },
      ],
      teachingNote:
        "20552 covers 1-2 muscles, 20553 covers 3 or more muscles. These are not billed per injection site. Botulinum toxin (J0585) is a separate drug code used for chronic migraine or spasticity, not standard trigger points.",
    },

    // Round 9: Genicular Nerve Block
    {
      id: "cs-r9",
      scenarioText:
        "A 70-year-old with severe knee osteoarthritis who is not a surgical candidate undergoes genicular nerve blocks as a diagnostic test before potential RFA.",
      category: "Joint Injections",
      correctCodes: [
        { code: "64450", description: "Peripheral nerve block, other" },
        { code: "M17.11", description: "Primary osteoarthritis, right knee" },
        { code: "76942", description: "Ultrasound guidance for needle placement" },
      ],
      incorrectCodes: [
        { code: "64640", description: "Destruction by neurolytic agent, other peripheral nerve" },
        { code: "20610", description: "Major joint injection" },
        { code: "M25.561", description: "Pain in right knee" },
        { code: "64447", description: "Femoral nerve block" },
        { code: "G89.29", description: "Other chronic pain" },
      ],
      teachingNote:
        "Genicular nerve blocks are coded as 64450 (peripheral nerve block, other). The diagnostic block must show >=50% relief before genicular RFA (64624) can be performed. M17.11 (primary OA, knee) supports necessity better than generic pain codes.",
    },

    // Round 10: Botulinum Toxin for Chronic Migraine
    {
      id: "cs-r10",
      scenarioText:
        "A 42-year-old with chronic migraine (>=15 headache days/month) receives onabotulinumtoxinA injections following the PREEMPT protocol at 31 sites.",
      category: "Mixed Pain Codes",
      correctCodes: [
        { code: "64615", description: "Chemodenervation of muscle(s); migraine" },
        { code: "G43.709", description: "Chronic migraine without aura, not intractable" },
        { code: "J0585", description: "OnabotulinumtoxinA, per 1 unit" },
      ],
      incorrectCodes: [
        { code: "20553", description: "Trigger point injection, 3+ muscles" },
        { code: "64612", description: "Chemodenervation of muscle(s); neck (dystonia)" },
        { code: "G43.009", description: "Migraine without aura, not intractable" },
        { code: "G44.1", description: "Vascular headache, NEC" },
        { code: "20552", description: "Trigger point injection, 1-2 muscles" },
      ],
      teachingNote:
        "64615 is the specific CPT for Botox injections for chronic migraine. 64612 is for cervical dystonia — a different indication. The chronic migraine diagnosis (G43.7xx) requires >=15 headache days/month for >=3 months. G43.0xx is episodic migraine.",
    },
  ],
};

export default codeSerpentPain;
