import { Repository } from 'typeorm';
import { CreateHelpDto } from './dto/create-help.dto';
import { UpdateHelpDto } from './dto/update-help.dto';
import { ReplyHelpDto } from './dto/reply-help.dto';
import { Help } from './entities/help.entity';
import { HelpSupportGateway } from './help-support.gateway';
export declare class HelpService {
    private readonly helpRepo;
    private readonly mailer;
    private readonly helpSupportGateway;
    constructor(helpRepo: Repository<Help>, mailer: {
        sendMail: (message: unknown) => Promise<{
            id?: string;
        }>;
    }, helpSupportGateway: HelpSupportGateway);
    create(createHelpDto: CreateHelpDto, companyId?: string): Promise<Help>;
    findAll(companyId?: string): Promise<Help[]>;
    getStats(companyId?: string): Promise<{
        total: number;
        pending: number;
        in_progress: number;
        resolved: number;
        active: number;
    }>;
    findOne(id: number, companyId?: string): Promise<Help>;
    update(id: number, updateHelpDto: UpdateHelpDto, companyId?: string): Promise<Help>;
    remove(id: number, companyId?: string): Promise<{
        success: boolean;
    }>;
    addReply(id: number, replyDto: ReplyHelpDto, companyId?: string): Promise<Help>;
    private sendSupportEmail;
}
