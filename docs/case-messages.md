# Case conversations in Assignments

Clients (parents, individuals, organizations and care foundations) open a case/project and choose Assignments > Case messages. Experts open an allocated case and use Case messages. Administrators can open the same section of a case they may access.

A message requires text and a recipient; attachments are optional. Up to five attachments, 10 MiB each, are accepted: PDF, JPEG/PNG/WebP, text/CSV, Office documents, MP3/WAV and MP4. HTTP/HTTPS links in message text are clickable. Attachments are protected PocketBase files and are downloaded only after checking the current user's view access.

Messages use the existing internal_messages collection with a case relation and protected attachments field. Each message is private to sender and recipient. Case clients may message only administrators or experts currently allocated to that specific case. Allocated experts may message that case's client or an administrator. The server rechecks ownership, allocation, active status and administrator permissions. A removed expert loses access to case messages and files, including through a previously obtained file token. Message text, recipient, sender, case and attachments cannot be edited; the recipient may mark a message as read. Generic administrator conversations retain their existing inbox.

Deploy the migration `1794800000_case_messages.js`, `pb_hooks/case-messages.pb.js`, `pb_hooks/lib/case-messaging.js` and the updated `pb_hooks/communication-backups.pb.js` together before publishing the frontend. The mirrored backend/pb copies are identical. Back up the database first; apply only reviewed migrations. No production or test server was changed for this feature. The local backend was backed up and migrated.

Verification: `python tests/case-messages-integration.py` uses a disposable database copy with outgoing SMTP disabled. It covers all client roles, both message directions, administrator replies, forged sender/recipient/case requests, immutable messages, protected attachment access and allocation revocation. `npm run typecheck` checks the frontend integration.
