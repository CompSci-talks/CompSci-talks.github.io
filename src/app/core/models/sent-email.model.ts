export interface SentEmail {
    id?: string;
    senderUid: string;
    recipientUids: string[];
    subject: string;
    bodySnippet: string;
    sentAt: Date;
}
