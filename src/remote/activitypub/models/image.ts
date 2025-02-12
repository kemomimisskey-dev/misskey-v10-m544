import { uploadFromUrl } from '../../../services/drive/upload-from-url';
import { IRemoteUser } from '../../../models/user';
import DriveFile, { IDriveFile } from '../../../models/drive-file';
import Resolver from '../resolver';
import fetchMeta from '../../../misc/fetch-meta';
import { apLogger } from '../logger';
import { IObject, isDocument } from '../type';
import { StatusError } from '../../../misc/fetch';

const logger = apLogger;

/**
 * Imageを作成します。
 */
export async function createImage(actor: IRemoteUser, value: IObject): Promise<IDriveFile | null | undefined> {
	// 投稿者が凍結か削除されていたらスキップ
	if (actor.isSuspended || actor.isDeleted) {
		return null;
	}

	const image = await new Resolver().resolve(value);

	if (!isDocument(image)) return null;

	if (typeof image.url !== 'string') {
		throw new Error('invalid image: url not privided');
	}

	logger.info(`Creating the Image: ${image.url}`);

	const instance = await fetchMeta();
	const cache = instance.cacheRemoteFiles;

	let file;
	try {
		file = await uploadFromUrl({ url: image.url, user: actor, uri: image.url, sensitive: !!image.sensitive, isLink: !cache });
	} catch (e) {
		// 4xxの場合は添付されてなかったことにする
		if (e instanceof StatusError && e.isClientError) {
			logger.warn(`Ignored image: ${image.url} - ${e.statusCode}`);
			return null;
		}

		throw e;
	}

	if (file.metadata?.isRemote) {
		// URLが異なっている場合、同じ画像が以前に異なるURLで登録されていたということなので、
		// URLを更新する
		if (file.metadata.url !== image.url) {
			file = await DriveFile.findOneAndUpdate({ _id: file._id }, {
				$set: {
					'metadata.url': image.url,
					'metadata.uri': image.url
				}
			}, {
				returnNewDocument: true
			});
		}
	}

	return file;
}

/**
 * Imageを解決します。
 *
 * Misskeyに対象のImageが登録されていればそれを返し、そうでなければ
 * リモートサーバーからフェッチしてMisskeyに登録しそれを返します。
 */
export async function resolveImage(actor: IRemoteUser, value: IObject): Promise<IDriveFile> {
	// TODO

	// リモートサーバーからフェッチしてきて登録
	return await createImage(actor, value);
}
