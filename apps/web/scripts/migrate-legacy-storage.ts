import { CopyObjectCommand, DeleteObjectCommand, ListObjectsV2Command, S3Client } from '@aws-sdk/client-s3'
import postgres from 'postgres'

if (process.env.MIGRATE_LEGACY_STORAGE !== '1') process.exit(0)

const databaseUrl = process.env.DATABASE_URL
const bucket = process.env.S3_BUCKET
const endpoint = process.env.S3_ENDPOINT
const region = process.env.S3_REGION || 'default'
const accessKeyId = process.env.S3_ACCESS_KEY_ID
const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY

if (!databaseUrl || !bucket || !endpoint || !accessKeyId || !secretAccessKey) {
  throw new Error('Legacy storage migration requires database and S3 configuration')
}

const sql = postgres(databaseUrl, { max: 1 })
const [settings] = await sql<{ id: string }[]>`SELECT id::text AS id FROM settings LIMIT 1`
if (!settings?.id) throw new Error('Legacy storage migration could not resolve settings.id')

const namespace = `w/${settings.id}/`
const client = new S3Client({
  region,
  endpoint,
  forcePathStyle: process.env.S3_FORCE_PATH_STYLE !== 'false',
  credentials: { accessKeyId, secretAccessKey },
})

let continuationToken: string | undefined
let moved = 0
let skipped = 0

do {
  const page = await client.send(
    new ListObjectsV2Command({ Bucket: bucket, ContinuationToken: continuationToken })
  )
  for (const item of page.Contents ?? []) {
    const key = item.Key
    if (!key || key.startsWith(namespace)) {
      skipped += 1
      continue
    }
    await client.send(
      new CopyObjectCommand({
        Bucket: bucket,
        Key: namespace + key,
        CopySource: encodeURIComponent(`${bucket}/${key}`),
      })
    )
    await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }))
    moved += 1
  }
  continuationToken = page.IsTruncated ? page.NextContinuationToken : undefined
} while (continuationToken)

await sql.end()
console.log(`Legacy storage migration complete: moved=${moved} skipped=${skipped}`)
